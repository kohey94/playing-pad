import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme, ColorModeScript } from "@chakra-ui/react";
import App from "./App";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",     // 起動時はダーク
    useSystemColorMode: false,    // OS設定に合わせない（手動切替）
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 初期カラーモードをDOMに反映（チラつき防止） */}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
