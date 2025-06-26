// ================================
// File: pages/_document.js
// Description: Custom Document component to customize HTML <html> and <body>.
//              Used for external font and icon CDN links.
// ================================
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Fonts - Inter */}
        <link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)" />
        <link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossOrigin="true" />
        <link
          href="[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)"
          rel="stylesheet"
        />
        {/* Font Awesome for icons */}
        <link
          rel="stylesheet"
          href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css)"
          xintegrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}