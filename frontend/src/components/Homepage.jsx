import React from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";
import heroVideo from "../assets/gigconnect.mp4"; // your video

const HeroSection = () => {
  return (
    <>
      <section className="hero">
        {/* Video Background */}
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="hero-overlay"></div>

        {/* Hero Content */}
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <h1>
              Find & Hire Expert <br /> Freelancers
            </h1>
            <p>
              Work with the best freelance talent from around the world on our
              secure, flexible, and cost-effective platform.
            </p>

            <div className="hero-links">
              <Link to="/login" className="hire-link">
                I want to Hire
              </Link>
              <Link to="/register" className="work-link">
                I want to Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works sections */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <h2>Clients</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Post a Gig</h3>
            <p>Describe your project, budget, and deadlines to attract talent.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Browse Freelancers</h3>
            <p>Review profiles, portfolios, and ratings to find the best fit.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Hire & Collaborate</h3>
            <p>Work securely, track progress, and pay after project completion.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works how-freelancer">
        <h2>Freelancers</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Profile</h3>
            <p>Showcase your skills, experience, and portfolio to clients.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Apply for Gigs</h3>
            <p>Find projects that match your skills and submit proposals.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Get Hired & Earn</h3>
            <p>Collaborate on projects, deliver quality work, and get paid safely.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
