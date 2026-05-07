import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import UploadSection from './components/UploadSection';
import Benefits from './components/Benefits';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <UploadSection />
        <Benefits />
      </main>
      <Footer />
    </>
  );
}
