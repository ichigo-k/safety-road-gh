'use client';

import { FluentProvider, webLightTheme } from '@fluentui/react-components';

export default function AppFluentProvider({ children }: { children: React.ReactNode }) {
  return <FluentProvider theme={webLightTheme}>{children}</FluentProvider>;
}
