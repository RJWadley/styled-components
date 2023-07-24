import React from 'react';
import constructWithOptions, { Styled } from '../constructors/constructWithOptions';
import css from '../constructors/css';
import withTheme from '../hoc/withTheme';
import _InlineStyle from '../models/InlineStyle';
import _StyledNativeComponent from '../models/StyledNativeComponent';
import ThemeProvider, {
  DefaultTheme,
  ThemeConsumer,
  ThemeContext,
  useTheme,
} from '../models/ThemeProvider';
import { BaseObject, NativeTarget } from '../types';
import isStyledComponent from '../utils/isStyledComponent';

const reactNative = require('react-native') as Awaited<typeof import('react-native')>;

const InlineStyle = _InlineStyle(reactNative.StyleSheet);
const StyledNativeComponent = _StyledNativeComponent(InlineStyle);

const baseStyled = <Target extends NativeTarget>(tag: Target) =>
  constructWithOptions<'native', DefaultTheme, Target>(StyledNativeComponent, tag);

/* React native lazy-requires each of these modules for some reason, so let's
 *  assume it's for a good reason and not eagerly load them all */
const aliases = [
  'ActivityIndicator',
  'Button',
  'DatePickerIOS',
  'DrawerLayoutAndroid',
  'FlatList',
  'Image',
  'ImageBackground',
  'KeyboardAvoidingView',
  'Modal',
  'Pressable',
  'ProgressBarAndroid',
  'ProgressViewIOS',
  'RefreshControl',
  'SafeAreaView',
  'ScrollView',
  'SectionList',
  'Slider',
  'Switch',
  'Text',
  'TextInput',
  'TouchableHighlight',
  'TouchableOpacity',
  'View',
  'VirtualizedList',
] as const;

type KnownComponents = (typeof aliases)[number];

/** Isolates RN-provided components since they don't expose a helper type for this. */
type RNComponents = {
  [K in keyof typeof reactNative]: (typeof reactNative)[K] extends React.ComponentType<any>
    ? (typeof reactNative)[K]
    : never;
};

export const styled = baseStyled as typeof baseStyled & {
  [E in KnownComponents]: Styled<
    'native',
    DefaultTheme,
    RNComponents[E],
    React.ComponentProps<RNComponents[E]>
  >;
};

export type ThemedStyledNativeFactory<Theme extends object = DefaultTheme> = (<
  Target extends NativeTarget
>(
  tag: Target
) => Styled<
  'web',
  Theme,
  Target,
  Target extends React.ComponentType<any> ? React.ComponentPropsWithRef<Target> : BaseObject
>) & {
  [E in keyof typeof reactNative]: Styled<
    'native',
    Theme,
    RNComponents[E],
    React.ComponentPropsWithRef<RNComponents[E]>
  >;
};

/**
 * This method is only necessary if there is a desire to provide separate `styled` factories that
 * are preconfigured for a particular custom theme. Most commonly this will be third-party libraries
 * composing styled-components that wish to skip the module-augmentation step that is typically
 * required for providing custom theme data.
 *
 * ```tsx
 * const styled = createThemedFactory<MyCustomTheme>();
 *
 * styled.View``
 * ```
 */
export const createThemedNativeFactory = <Theme extends object>() =>
  styled as ThemedStyledNativeFactory<Theme>;

/* Define a getter for each alias which simply gets the reactNative component
 * and passes it to styled */
aliases.forEach(alias =>
  Object.defineProperty(styled, alias, {
    enumerable: true,
    configurable: false,
    get() {
      if (alias in reactNative && reactNative[alias]) {
        return styled(reactNative[alias]);
      }

      throw new Error(
        `${alias} is not available in the currently-installed version of react-native`
      );
    },
  })
);

export {
  DefaultTheme,
  ExecutionContext,
  ExecutionProps,
  IStyledComponent,
  IStyledComponentFactory,
  IStyledStatics,
  NativeTarget,
  PolymorphicComponent,
  PolymorphicComponentProps,
  Runtime,
  StyledObject,
  StyledOptions,
} from '../types';
export { css, isStyledComponent, ThemeProvider, ThemeConsumer, ThemeContext, withTheme, useTheme };
export { styled as default };
