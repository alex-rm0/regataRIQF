import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style>{`
          @font-face {
            font-family: 'Montserrat_400Regular';
            src: url('https://cdn.jsdelivr.net/npm/@expo-google-fonts/montserrat@0.4.2/400Regular/Montserrat_400Regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'Montserrat_500Medium';
            src: url('https://cdn.jsdelivr.net/npm/@expo-google-fonts/montserrat@0.4.2/500Medium/Montserrat_500Medium.ttf') format('truetype');
            font-weight: 500;
            font-style: normal;
          }
          @font-face {
            font-family: 'Montserrat_600SemiBold';
            src: url('https://cdn.jsdelivr.net/npm/@expo-google-fonts/montserrat@0.4.2/600SemiBold/Montserrat_600SemiBold.ttf') format('truetype');
            font-weight: 600;
            font-style: normal;
          }
          @font-face {
            font-family: 'Montserrat_700Bold';
            src: url('https://cdn.jsdelivr.net/npm/@expo-google-fonts/montserrat@0.4.2/700Bold/Montserrat_700Bold.ttf') format('truetype');
            font-weight: 700;
            font-style: normal;
          }
          @font-face {
            font-family: 'Montserrat_800ExtraBold';
            src: url('https://cdn.jsdelivr.net/npm/@expo-google-fonts/montserrat@0.4.2/800ExtraBold/Montserrat_800ExtraBold.ttf') format('truetype');
            font-weight: 800;
            font-style: normal;
          }
          @font-face {
            font-family: 'Ionicons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.3/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.3/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
