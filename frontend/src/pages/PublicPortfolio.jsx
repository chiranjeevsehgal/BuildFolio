// PublicPortfolio.jsx - Component to render public portfolio at /:username
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { getTemplateComponent } from "../templates/TemplateRegistry";
import axios from "axios";

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (username) {
      loadPortfolioData();
    }
  }, [username]);

  useEffect(() => {
    if (portfolioData) {
      // Dynamic title
      const title =
        portfolioData.seoData?.title ||
        `${portfolioData.firstName} ${portfolioData.lastName} - Portfolio`;
      document.title = title;

      // Dynamic meta description
      const description =
        portfolioData.seoData?.description ||
        portfolioData.professional?.summary ||
        `Professional portfolio of ${portfolioData.firstName} ${portfolioData.lastName}`;

      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;

      // Dynamic meta keywords
      if (portfolioData.seoData?.keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement("meta");
          metaKeywords.name = "keywords";
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = portfolioData.seoData.keywords;
      }

      // Open Graph meta tags
      const ogTitle = `${portfolioData.firstName} ${portfolioData.lastName} - Portfolio`;
      const ogDescription = description;
      const ogUrl = window.location.href;

      // Update OG Title
      let ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement("meta");
        ogTitleMeta.setAttribute("property", "og:title");
        document.head.appendChild(ogTitleMeta);
      }
      ogTitleMeta.content = ogTitle;

      // Update OG Description
      let ogDescMeta = document.querySelector(
        'meta[property="og:description"]',
      );
      if (!ogDescMeta) {
        ogDescMeta = document.createElement("meta");
        ogDescMeta.setAttribute("property", "og:description");
        document.head.appendChild(ogDescMeta);
      }
      ogDescMeta.content = ogDescription;

      // Update OG Type
      let ogTypeMeta = document.querySelector('meta[property="og:type"]');
      if (!ogTypeMeta) {
        ogTypeMeta = document.createElement("meta");
        ogTypeMeta.setAttribute("property", "og:type");
        document.head.appendChild(ogTypeMeta);
      }
      ogTypeMeta.content = "website";

      // Update OG URL
      let ogUrlMeta = document.querySelector('meta[property="og:url"]');
      if (!ogUrlMeta) {
        ogUrlMeta = document.createElement("meta");
        ogUrlMeta.setAttribute("property", "og:url");
        document.head.appendChild(ogUrlMeta);
      }
      ogUrlMeta.content = ogUrl;

      // Add profile photo as OG image if available
      if (portfolioData.profilePhoto) {
        let ogImageMeta = document.querySelector('meta[property="og:image"]');
        if (!ogImageMeta) {
          ogImageMeta = document.createElement("meta");
          ogImageMeta.setAttribute("property", "og:image");
          document.head.appendChild(ogImageMeta);
        }
        ogImageMeta.content = portfolioData.profilePhoto;
      }

      // Twitter Card meta tags
      let twitterCardMeta = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCardMeta) {
        twitterCardMeta = document.createElement("meta");
        twitterCardMeta.name = "twitter:card";
        document.head.appendChild(twitterCardMeta);
      }
      twitterCardMeta.content = "summary_large_image";

      let twitterTitleMeta = document.querySelector(
        'meta[name="twitter:title"]',
      );
      if (!twitterTitleMeta) {
        twitterTitleMeta = document.createElement("meta");
        twitterTitleMeta.name = "twitter:title";
        document.head.appendChild(twitterTitleMeta);
      }
      twitterTitleMeta.content = ogTitle;

      let twitterDescMeta = document.querySelector(
        'meta[name="twitter:description"]',
      );
      if (!twitterDescMeta) {
        twitterDescMeta = document.createElement("meta");
        twitterDescMeta.name = "twitter:description";
        document.head.appendChild(twitterDescMeta);
      }
      twitterDescMeta.content = ogDescription;

      if (portfolioData.profilePhoto) {
        let twitterImageMeta = document.querySelector(
          'meta[name="twitter:image"]',
        );
        if (!twitterImageMeta) {
          twitterImageMeta = document.createElement("meta");
          twitterImageMeta.name = "twitter:image";
          document.head.appendChild(twitterImageMeta);
        }
        twitterImageMeta.content = portfolioData.profilePhoto;
      }
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = "BuildFolio - Professional Portfolio Builder";
    };
  }, [portfolioData]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch public portfolio data
      const response = await axios.get(
        `${API_BASE_URL}/portfolio/public/${username}`,
      );

      if (response.data.success) {
        const data = response.data.data;

        // Get the template component
        const templateInfo = getTemplateComponent(data.selectedTemplate);

        if (!templateInfo) {
          throw new Error(`Template not found: ${data.selectedTemplate}`);
        }

        setPortfolioData({
          ...data,
          templateComponent: templateInfo.component,
        });
      } else {
        throw new Error(response.data.message || "Portfolio not found");
      }
    } catch (error) {
      console.error("Failed to load portfolio:", error);
      setError(
        error.response?.status === 404
          ? "Portfolio not found"
          : "Failed to load portfolio",
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
          <p className="text-sm text-gray-500 mt-2">@{username}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Portfolio Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            The portfolio for <strong>@{username}</strong> could not be found or
            is not public.
          </p>
        </div>
      </div>
    );
  }

  // Render portfolio
  if (portfolioData && portfolioData.templateComponent) {
    const TemplateComponent = portfolioData.templateComponent;

    return (
      <div>
        {/* SEO Meta Tags */}
        <head>
          <title>
            {portfolioData.firstName} {portfolioData.lastName} - Portfolio
          </title>
          <meta
            name="description"
            content={
              portfolioData.professional?.summary ||
              `Professional portfolio of ${portfolioData.firstName} ${portfolioData.lastName}`
            }
          />
          <meta
            property="og:title"
            content={`${portfolioData.firstName} ${portfolioData.lastName} - Portfolio`}
          />
          <meta
            property="og:description"
            content={portfolioData.professional?.summary}
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />
        </head>

        <TemplateComponent userData={portfolioData} />
      </div>
    );
  }

  return null;
};

export default PublicPortfolio;
