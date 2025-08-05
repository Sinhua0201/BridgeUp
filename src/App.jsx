import Navbar from "./components/navbar";
import Footer from "./components/footer";
import AppRoutes from "./routes";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
