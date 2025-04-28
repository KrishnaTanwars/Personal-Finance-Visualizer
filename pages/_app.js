// pages/_app.js
import '../styles/style.css';  // <-- Import your global CSS here

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
