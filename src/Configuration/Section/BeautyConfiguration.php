<?php

namespace Photobooth\Configuration\Section;

use Symfony\Component\Config\Definition\Builder\NodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;

final class BeautyConfiguration
{
    public static function getNode(): NodeDefinition
    {
        return (new TreeBuilder('beauty'))->getRootNode()->addDefaultsIfNotSet()
            ->ignoreExtraKeys()
            ->children()
                ->booleanNode('enabled')->defaultValue(true)->end()
                ->booleanNode('auto_apply')->defaultValue(true)->end()
                ->integerNode('default_eye')
                    ->defaultValue(15)
                    ->min(0)
                    ->max(100)
                    ->beforeNormalization()
                        ->ifString()
                        ->then(function (string $value): int {
                            return intval($value);
                        })
                    ->end()
                ->end()
                ->integerNode('default_slim')
                    ->defaultValue(15)
                    ->min(0)
                    ->max(100)
                    ->beforeNormalization()
                        ->ifString()
                        ->then(function (string $value): int {
                            return intval($value);
                        })
                    ->end()
                ->end()
                ->integerNode('default_smooth')
                    ->defaultValue(20)
                    ->min(0)
                    ->max(100)
                    ->beforeNormalization()
                        ->ifString()
                        ->then(function (string $value): int {
                            return intval($value);
                        })
                    ->end()
                ->end()
                ->integerNode('default_white')
                    ->defaultValue(15)
                    ->min(0)
                    ->max(100)
                    ->beforeNormalization()
                        ->ifString()
                        ->then(function (string $value): int {
                            return intval($value);
                        })
                    ->end()
                ->end()
                ->integerNode('default_rosy')
                    ->defaultValue(20)
                    ->min(0)
                    ->max(100)
                    ->beforeNormalization()
                        ->ifString()
                        ->then(function (string $value): int {
                            return intval($value);
                        })
                    ->end()
                ->end()
                ->integerNode('default_clarity')
                    ->defaultValue(15)
                    ->min(0)
                    ->max(100)
                    ->beforeNormalization()
                        ->ifString()
                        ->then(function (string $value): int {
                            return intval($value);
                        })
                    ->end()
                ->end()
                ->scalarNode('service_url')->defaultValue('http://127.0.0.1:8001')->end()
            ->end();
    }
}
