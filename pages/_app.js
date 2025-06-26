// ================================
// File: pages/_app.js
// Description: Custom App component to initialize pages and apply global styles.
//              Now directly wraps Component with MainContent for consistent layout.
// ================================
import '../styles/globals.css'; // Import your global styles
import React from 'react';
import MainContent from '../components/MainContent'; // MainContent will now act as a layout provider

function MyApp({ Component, pageProps }) {
  // MainContent now acts as a layout wrapper for all pages.
  // The actual page component (Component) is passed as a child.
  return (
    <MainContent>
      <Component {...pageProps} />
    </MainContent>
  );
}

export default MyApp;