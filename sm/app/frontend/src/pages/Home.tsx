import Header from "@/components/Header";
import UserHeader from "@/components/UserHeader";
import Footer from "@/components/Footer";
import './Dashboard.css';

const getToken = () => {
  return localStorage.getItem("token");
};

const Home = () => {
  const token = getToken();
  return (
    <div className="flex flex-col min-h-screen">
      {token ? <UserHeader /> : <Header />}
      <div className="flex-1">
        <div className="content">
          BLA BLA
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
