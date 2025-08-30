import React, { useEffect, useState } from "react";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaClock, FaDollarSign, FaTasks } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import CountUp from "react-countup";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setRole(decodedToken.user.role);

        const fetchUserData = async () => {
          try {
            const response = await api.get("/profile");
            setUserData(response.data);
          } catch (error) {
            if (error.response && error.response.status === 401) navigate("/login");
          }
        };

        const fetchStats = async () => {
          try {
            const url =
              decodedToken.user.role === "client"
                ? "/gigs/client/stats"
                : "/gigs/freelancer/stats";
            const res = await api.get(url);
            setStats(res.data);

            if (decodedToken.user.role === "client") {
              setChartData({
                labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                datasets: [
                  {
                    label: "Gigs Posted",
                    data: res.data.monthlyPosted || Array(12).fill(0),
                    borderColor: "#007bff",
                    backgroundColor: "rgba(0,123,255,0.2)",
                  },
                  {
                    label: "Completed Gigs",
                    data: res.data.monthlyCompleted || Array(12).fill(0),
                    borderColor: "#28a745",
                    backgroundColor: "rgba(40,167,69,0.2)",
                  },
                ],
              });
            } else {
              setChartData({
                labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                datasets: [
                  {
                    label: "Gigs Completed",
                    data: res.data.monthlyCompleted || Array(12).fill(0),
                    borderColor: "#28a745",
                    backgroundColor: "rgba(40,167,69,0.2)",
                  },
                  {
                    label: "Earnings",
                    data: res.data.monthlyEarnings || Array(12).fill(0),
                    borderColor: "#ffc107",
                    backgroundColor: "rgba(255,193,7,0.2)",
                  },
                ],
              });
            }
          } catch (err) {
            console.error("Error fetching stats:", err.response);
          }
        };

        fetchUserData();
        fetchStats();
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!userData || !stats || !chartData)
    return <div className="dashboard-loading">Loading dashboard...</div>;

  const getPercentage = (value, total) =>
    total ? Math.round((value / total) * 100) : 0;

  const totalClientGigs = stats.completed + stats.active + stats.inProgress;
  const totalFreelancerGigs = stats.completed + stats.inProgress;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {userData.username}!</h1>
       
      </header>

      <div className="cards-grid">
        {role === "client" && (
          <>
            <div className="card completed">
              <FaCheckCircle className="card-icon completed-icon" />
              <h3>Completed Gigs</h3>
              <p><CountUp end={stats.completed} duration={1.5} /></p>
              <div className="progress-bar">
                <div
                  className="progress-fill completed"
                  style={{ width: `${getPercentage(stats.completed, totalClientGigs)}%` }}
                />
              </div>
            </div>

            <div className="card active">
              <FaTasks className="card-icon active-icon" />
              <h3>Active Gigs</h3>
              <p><CountUp end={stats.active} duration={1.5} /></p>
              <div className="progress-bar">
                <div
                  className="progress-fill active"
                  style={{ width: `${getPercentage(stats.active, totalClientGigs)}%` }}
                />
              </div>
            </div>

            <div className="card inprogress">
              <FaClock className="card-icon inprogress-icon" />
              <h3>In Progress</h3>
              <p><CountUp end={stats.inProgress} duration={1.5} /></p>
              <div className="progress-bar">
                <div
                  className="progress-fill inprogress"
                  style={{ width: `${getPercentage(stats.inProgress, totalClientGigs)}%` }}
                />
              </div>
            </div>
          </>
        )}

        {role === "freelancer" && (
          <>
            <div className="card completed">
              <FaCheckCircle className="card-icon completed-icon" />
              <h3>Completed Gigs</h3>
              <p><CountUp end={stats.completed} duration={1.5} /></p>
              <div className="progress-bar">
                <div
                  className="progress-fill completed"
                  style={{ width: `${getPercentage(stats.completed, totalFreelancerGigs)}%` }}
                />
              </div>
            </div>

            <div className="card inprogress">
              <FaClock className="card-icon inprogress-icon" />
              <h3>In Progress</h3>
              <p><CountUp end={stats.inProgress} duration={1.5} /></p>
              <div className="progress-bar">
                <div
                  className="progress-fill inprogress"
                  style={{ width: `${getPercentage(stats.inProgress, totalFreelancerGigs)}%` }}
                />
              </div>
            </div>

            <div className="card earnings">
              <FaDollarSign className="card-icon earnings-icon" />
              <h3>Total Earnings</h3>
              <p>₹ <CountUp end={stats.earnings} duration={1.5} separator="," /></p>
            </div>
          </>
        )}
      </div>

      <div className="chart-container">
        <h2>Monthly Trend</h2>
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>
    </div>
  );
};

export default Dashboard;
