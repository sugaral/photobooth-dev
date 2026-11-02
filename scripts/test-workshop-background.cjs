const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {request} = require('playwright');
const base = process.env.PHOTOBOOTH_TEST_URL || 'http://127.0.0.1:8000';
(async()=>{
 const ctx=await request.newContext({baseURL:base,timeout:300000});
 const files=[];
 try{
  const {token:csrf}=await (await ctx.get('/api/csrf.php')).json();
  const image='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'../resources/img/templates_ai/woman/01_white_fairy_01.jpg')).toString('base64');
  const tokens=[];
  for(let i=0;i<2;i++){
   const data=await (await ctx.post('/api/capture.php',{form:{csrf,style:'photo',canvasimg:image}})).json();
   assert.ok(data.capture_token,data.error); tokens.push(data.capture_token);files.push(data.file);
  }
  const form={csrf,layout:'duo','tokens[0]':tokens[0],'tokens[1]':tokens[1]};
  const invalid=await ctx.post('/api/createWorkshop.php',{form:{...form,template:'../photobooth/.runtime/workshop-review/finished-photo.jpg'}});
  assert.equal(invalid.status(),400,'Paths outside background folders must be rejected');
  const plain=await (await ctx.post('/api/createWorkshop.php',{form})).json();
  assert.ok(plain.success,plain.error);files.push(plain.file);
  const bgForm={...form,template:'resources/img/templates/id_blue.png'};
  const background=await (await ctx.post('/api/createWorkshop.php',{form:bgForm})).json();
  assert.ok(background.success,background.error);files.push(background.file);
  assert.notEqual(background.file,plain.file,'Background selection must affect export identity');
  assert.notDeepEqual(fs.readFileSync(path.join(__dirname,'../data/images',background.file)),fs.readFileSync(path.join(__dirname,'../data/images',plain.file)),'Background must change the saved photo');
  const repeat=await (await ctx.post('/api/createWorkshop.php',{form:bgForm})).json();
  assert.equal(repeat.file,background.file,'Background export retry is idempotent');
  fs.copyFileSync(path.join(__dirname,'../data/images',background.file),path.join(__dirname,'../.runtime/workshop-review/finished-background.jpg'));
  console.log('PASS actual AI background composition, separate export identities, idempotent retry, invalid background rejection');
 }finally{
  await ctx.dispose();
  const cleanup=spawnSync(path.resolve(__dirname,'../.runtime/php/php.exe'),['-r',`require 'lib/boot.php'; $db=Photobooth\\Service\\DatabaseManagerService::getInstance(); foreach(array_slice($argv,1) as $file){if(!preg_match('/^[a-zA-Z0-9_-]+\\.jpg$/D',$file))continue;$db->deleteContentFromDB($file);foreach(['data/images','data/thumbs','data/tmp'] as $folder){$p=$folder.'/'.$file;if(is_file($p))unlink($p);}}`,...files],{cwd:path.resolve(__dirname,'..'),encoding:'utf8'});
  assert.equal(cleanup.status,0,cleanup.stderr);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
