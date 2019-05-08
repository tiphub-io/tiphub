// The @types/react-syntax-highlighter module is viciously out of date, so
// here we'll define only what we need

declare module 'react-syntax-highlighter/dist/esm/light' {
  const Light: any;
  export default Light;
}

declare module 'react-syntax-highlighter/dist/esm/languages/hljs/xml' {
  const xml: any;
  export default xml;
}


declare module 'react-syntax-highlighter/dist/styles/hljs/xcode' {
  const style: any;
  export default style;
}
