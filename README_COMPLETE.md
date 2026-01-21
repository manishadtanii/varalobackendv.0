<!-- import React, { useState, useEffect } from "react";
import SectionEditor from "../components/SectionEditor"; // The component created in the previous step
import MediaLibraryModal from "../components/MediaLibraryModal";
import ContactSubmissions from "../components/ContactSubmissions";
import LoadingScreen from "../components/LoadingScreen";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineDatabase,
  HiChevronDown,
  HiChevronRight,
  HiOutlineHome,        // Homepage
  HiOutlineUserGroup,   // About Us
  HiOutlineViewGrid,    // Our Services
  HiOutlineMail,        // Contact Us
  HiOutlineBriefcase,   // Management
  HiOutlinePlay,        // Stream
  HiOutlineBookOpen,    // Books
  HiOutlineShare,       // Connect
  HiOutlineShieldCheck, // Verify
  HiOutlineChartBar,    // Reporting
  HiOutlineUserCircle,
  HiOutlineInbox,
  HiOutlineLogout,      // Logout icon
} from "react-icons/hi";
// Import API Service
import { pageAPI, sectionAPI, uploadAPI } from "../../services/apiService";
// 1. Import your custom section components
import Hero from "../section/home/Hero";
import Experience from "../section/home/Experience";
import Services from "../section/home/Services";
import Trust from "../section/home/Trust";
import Capabilities from "../section/home/Capabilities";
import Testimonials from "../section/home/Testimonials";
import AboutHero from "../section/about/Hero";
import Vision from "../section/about/Vision";
import Mission from "../section/about/Mission";
import Journey from "../section/about/Journey";
import Founder from "../section/about/Founder";
import Team from "../section/about/Team";
import TestimonialsAbout from "../section/about/Testimonials";
import ASupportCompany from "../section/service/ASupportCompany";
import AllServices from "../section/service/AllServices";
import StartYourJourney from "../section/contact/StartYourJourney";
import ContactUs from "../section/contact/ContactUs";
import AgencyManagement from "../section/management/AgencyManagement";
import ServiceOverview from "../section/management/ServiceOverview";
import WhatWeOffer from "../section/management/WhatWeOffer";
import WhatWeProvide from "../section/management/WhatWeProvide";
import AgencyStream from "../section/stream/AgencyStream";
import StreamServiceOverview from "../section/stream/ServiceOverview";
import StreamWhatWeOffer from "../section/stream/WhatWeOffer";
import StreamWhatWeProvide from "../section/stream/WhatWeProvide";
import StreamTestimonials from "../section/stream/Testimonials";
import AgencyBooks from "../section/books/AgencyBooks";
import BooksServiceOverview from "../section/books/BooksServiceOverview";
import BooksWhatWeOffer from "../section/books/BooksWhatWeOffer";
import BooksWhatWeProvide from "../section/books/BooksWhatWeProvide";
import BooksTestimonials from "../section/books/BooksTestimonials";
import AgencyConnect from "../section/connect/AgencyConnect";
import ConnectServiceOverview from "../section/connect/ConnectServiceOverview";
import ConnectWhatWeOffer from "../section/connect/ConnectWhatWeOffer";
import ConnectWhatWeProvide from "../section/connect/ConnectWhatWeProvide";
import ConnectTestimonials from "../section/connect/ConnectTestimonials";
import AgencyVerify from "../section/verify/AgencyVerify";
import VerifyServiceOverview from "../section/verify/VerifyServiceOverview";
import VerifyWhatWeOffer from "../section/verify/VerifyWhatWeOffer";
import VerifyWhatWeProvide from "../section/verify/VerifyWhatWeProvide";
import VerifyTestimonials from "../section/verify/VerifyTestimonials";
import AgencyReporting from "../section/reporting/AgencyReporting";
import ReportingServiceOverview from "../section/reporting/ReportingServiceOverview";
import ReportingWhatWeOffer from "../section/reporting/ReportingWhatWeOffer";
import ReportingWhatWeProvide from "../section/reporting/ReportingWhatWeProvide";
import ReportingTestimonials from "../section/reporting/ReportingTestimonials";


const Dashboard = () => {
  // Restore from localStorage or use defaults
  const [activePage, setActivePage] = useState(() => localStorage.getItem('cms_activePage') || "home");
  const [activeId, setActiveId] = useState(() => localStorage.getItem('cms_activeId') || "Hero");
  const [openMenu, setOpenMenu] = useState("home");
  const [cmsData, setCmsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState("view"); // "view" or "select"
  const [currentImageFieldName, setCurrentImageFieldName] = useState(null); // Track which field to populate
  const navigate = useNavigate();

  // Save to localStorage whenever activePage or activeId changes
  useEffect(() => {
    localStorage.setItem('cms_activePage', activePage);
    localStorage.setItem('cms_activeId', activeId);
    console.log(`💾 Saved to localStorage: ${activePage} → ${activeId}`);
  }, [activePage, activeId]);

  // Fetch all page data on component mount
  useEffect(() => {
    const fetchCriticalPagesOnly = async () => {
      try {
        setLoading(true);
        
        // CRITICAL PAGES - Load immediately (Home + Contact for forms)
        const criticalPages = ['home', 'contact'];
        const pageMap = {};
        
        console.log('⚡ Loading CRITICAL pages only:', criticalPages);
        
        // Load critical pages in parallel (faster)
        const criticalPromises = criticalPages.map(async (slug) => {
          try {
            const result = await pageAPI.getPageBySlug(slug);
            if (result?.data) {
              pageMap[slug] = result.data;
              console.log(`✅ Loaded critical page: ${slug}`);
            }
          } catch (err) {
            console.error(`❌ Failed to load ${slug}:`, err);
          }
        });
        
        await Promise.all(criticalPromises);
        
        setCmsData(pageMap);
        console.log('✅ Critical pages loaded, app ready!', pageMap);
        
        // BACKGROUND: Fetch all page list for sidebar (non-blocking)
        setTimeout(async () => {
          try {
            const pagesResponse = await pageAPI.getPages();
            if (pagesResponse.data && Array.isArray(pagesResponse.data)) {
              console.log('📋 Pages list available in background');
              // Remove pre-fetching for 'about' and 'service' - users will load on demand
              // This reduces initial API calls
            }
          } catch (error) {
            console.error('⚠️ Background page list load failed');
          }
        }, 500); // Delay so it doesn't block initial render
        
      } catch (error) {
        console.error('❌ Critical data load failed:', error);
        toast.error('Failed to load critical data');
      } finally {
        setLoading(false);
      }
    };

    fetchCriticalPagesOnly();
  }, []);

  // Ensure service subpages are loaded when activePage is a service slug (tvg-*)
  useEffect(() => {
    const loadPageOnDemand = async () => {
      if (!activePage) return;
      
      // Skip if already loaded
      if (cmsData[activePage]) {
        console.log(`✅ ${activePage} already loaded`);
        return;
      }

      try {
        setLoading(true);
        console.log(`📡 Lazy loading page on demand: ${activePage}`);
        
        // Determine if it's a service page (starts with "tvg-" or contains "/tvg-")
        const isServicePage = activePage.startsWith('tvg-') || activePage.includes('tvg-');
        
        // Extract the slug for service pages (tvg-stream from services/tvg-stream)
        const slug = isServicePage ? activePage.split('/').pop() : activePage;
        
        console.log(`🔍 Fetching - isServicePage: ${isServicePage}, slug: ${slug}, activePage: ${activePage}`);
        
        const result = isServicePage 
          ? await pageAPI.getServiceBySlug(slug)
          : await pageAPI.getPageBySlug(activePage);
        
        console.log(`📥 API Result for ${slug}:`, result?.data);
        
        if (result?.data) {
          setCmsData((prev) => ({ ...prev, [activePage]: result.data }));
          console.log(`✅ Loaded on demand: ${activePage}`, result.data);
        } else {
          console.log(`⚠️ No data returned from API for ${slug}`);
        }
      } catch (err) {
        console.error(`❌ Failed to load ${activePage}:`, err);
        toast.error(`Failed to load ${activePage}`);
      } finally {
        setLoading(false);
      }
    };

    loadPageOnDemand();
  }, [activePage, cmsData]);

  // Toggle function to switch between pages
  const toggle = (pageName) => {
    setActivePage(pageName);
    setOpenMenu(openMenu === pageName ? null : pageName);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  // Handle image selection from MediaLibrary (Select mode)
  const handleImageSelected = (imageUrl) => {
    if (!currentImageFieldName) {
      console.warn("⚠️ No field name specified for image");
      return;
    }

    console.log(`🖼️ Image selected for field: ${currentImageFieldName}`);
    console.log(`🔗 Image URL: ${imageUrl}`);

    // Update the active section's data with the selected image
    // Trigger parent component to handle the image update
    const event = new CustomEvent("imageSelected", {
      detail: {
        fieldName: currentImageFieldName,
        imageUrl: imageUrl,
      },
    });
    window.dispatchEvent(event);

    // Reset state
    setMediaLibraryOpen(false);
    setMediaMode("view");
    setCurrentImageFieldName(null);

    toast.success("Image selected and populated!");
  };

  // Open media library in SELECT mode for a specific field
  const openMediaLibraryForField = (fieldName) => {
    console.log(`📂 Opening media library for field: ${fieldName}`);
    setMediaMode("select");
    setCurrentImageFieldName(fieldName);
    setMediaLibraryOpen(true);
  };

  // 2. Logic to pick the right component based on the sidebar selection
  const renderActiveEditor = () => {
    // This looks at the activeId set by your sidebar buttons
    switch (activeId) {
      case "Hero":
        return (
          <Hero 
            sectionData={activeSectionData} 
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Experience":
        return (
          <Experience
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Services":
        return (
          <Services
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Trust":
        return (
          <Trust sectionData={activeSectionData} onSave={handleUpdateSection} onBrowseLibrary={openMediaLibraryForField} />
        );
      case "Capabilities":
        return (
          <Capabilities
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Testimonials":
        return (
          <Testimonials
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "About-Hero":
        return (
          <AboutHero
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Vision":
        return (
          <Vision
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Mission":
        return (
          <Mission
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Journey":
        return (
          <Journey
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Founder":
        return (
          <Founder
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Team":
        return (
          <Team
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Testimonials-About":
        return (
          <TestimonialsAbout
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "A Support Company":
        return (
          <ASupportCompany
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "All Service":
        return (
          <AllServices
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Start Your Journey":
        return (
          <StartYourJourney
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Contact Us":
        return (
          <ContactUs
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Agency Management":
        return (
          <AgencyManagement
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Service Overview":
        if (!activePage.includes('tvg-')) {
          return (
            <ServiceOverview
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        }
        break;
      case "What We Offer":
        if (!activePage.includes('tvg-')) {
          return (
            <WhatWeOffer
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        }
        break;
      case "What We Provide":
        if (!activePage.includes('tvg-')) {
          return (
            <WhatWeProvide
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        }
        break;
      case "Agency Stream":
        return (
          <AgencyStream
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Stream Service Overview":
        return (
          <StreamServiceOverview
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Stream What We Offer":
        return (
          <StreamWhatWeOffer
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Stream What We Provide":
        return (
          <StreamWhatWeProvide
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Stream Testimonials":
        return (
          <StreamTestimonials
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
          />
        );
      case "Agency Books":
        return (
          <AgencyBooks
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Books Service Overview":
        return (
          <BooksServiceOverview
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Books What We Offer":
        return (
          <BooksWhatWeOffer
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Books What We Provide":
        return (
          <BooksWhatWeProvide
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
          />
        );
      case "Books Testimonials":
        return (
          <BooksTestimonials
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
          />
        );
      case "Agency Connect":
        return (
          <AgencyConnect
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Connect Service Overview":
        return (
          <ConnectServiceOverview
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Connect What We Offer":
        return (
          <ConnectWhatWeOffer
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Connect What We Provide":
        return (
          <ConnectWhatWeProvide
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
          />
        );
      case "Connect Testimonials":
        return (
          <ConnectTestimonials
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
          />
        );
      case "Agency Verify":
        return (
          <AgencyVerify
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Service Overview":
        if (activePage === "services/tvg-verify") {
          return (
            <VerifyServiceOverview
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        } else if (activePage === "services/tvg-reporting") {
          return (
            <ReportingServiceOverview
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        }
        break;
      case "What We Offer":
        if (activePage === "services/tvg-verify") {
          return (
            <VerifyWhatWeOffer
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        } else if (activePage === "services/tvg-reporting") {
          return (
            <ReportingWhatWeOffer
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        }
        break;
      case "What We Provide":
        if (activePage === "services/tvg-verify") {
          return (
            <VerifyWhatWeProvide
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        } else if (activePage === "services/tvg-reporting") {
          return (
            <ReportingWhatWeProvide
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        }
        break;
      case "Testimonials":
        if (activePage === "services/tvg-verify") {
          return (
            <VerifyTestimonials
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        } else if (activePage === "services/tvg-reporting") {
          return (
            <ReportingTestimonials
              sectionData={activeSectionData}
              onSave={handleUpdateSection}
              onBrowseLibrary={openMediaLibraryForField}
            />
          );
        }
        break;
      case "Agency Reporting":
        return (
          <AgencyReporting
            sectionData={activeSectionData}
            onSave={handleUpdateSection}
            onBrowseLibrary={openMediaLibraryForField}
          />
        );
      case "Contact Submissions":
        return <ContactSubmissions />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 border-2 border-dashed border-gray-800 rounded-3xl">
            <p>Select a valid section to begin editing.</p>
          </div>
        );
    }
  };

  // Logic to handle saving section data via API
  const handleUpdateSection = async (updatedData, imageFile = null, imageFieldPath = null) => {
    try {
      console.log("🔄 Updating section:", activePage, activeId, updatedData);
      
      // Convert activePage to proper slug format
      const pageSlug = activePage;
      
      // Convert activeId to sectionKey format (match database format)
      let sectionKey = activeId.toLowerCase().replace(/\s+/g, '-');
      
      // For about page, strip the "about-" prefix
      if (activePage === 'about' && sectionKey.startsWith('about-')) {
        sectionKey = sectionKey.replace('about-', '');
      }

      // Handle special case: "Team" button maps to "leadership_team" sectionKey
      if (sectionKey === 'team') {
        sectionKey = 'leadership_team';
        console.log(`🔄 Converted "team" → "leadership_team"`);
      }

      // Handle special cases for Services page sections
      if (activePage === 'services') {
        if (sectionKey === 'a-support-company') {
          sectionKey = 'services-hero';
          console.log(`🔄 Converted "A Support Company" → "services-hero"`);
        } else if (sectionKey === 'all-service') {
          sectionKey = 'services-grid';
          console.log(`🔄 Converted "All Service" → "services-grid"`);
        }
      }

      // Handle special cases for service subpages (TVG services)
      if (activePage && (activePage.startsWith('tvg-') || activePage.includes('tvg-'))) {
        if (sectionKey === 'agency-management') {
          sectionKey = 'hero';
          console.log(`🔄 Converted "Agency Management" → "hero"`);
        } else if (sectionKey === 'service-overview') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Service Overview" → "overview"`);
        } else if (sectionKey === 'what-we-offer') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'what-we-provide') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "What We Provide" → "provide"`);
        }
        
        // Stream sections (new unique IDs)
        if (sectionKey === 'agency-stream') {
          sectionKey = 'hero';
          console.log(`🔄 Converted "Agency Stream" → "hero"`);
        } else if (sectionKey === 'stream-service-overview') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Stream Service Overview" → "overview"`);
        } else if (sectionKey === 'stream-what-we-offer') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "Stream What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'stream-what-we-provide') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "Stream What We Provide" → "provide"`);
        } else if (sectionKey === 'stream-testimonials') {
          sectionKey = 'testimonials';
          console.log(`🔄 Converted "Stream Testimonials" → "testimonials"`);
        }
        
        // Books sections (new unique IDs)
        if (sectionKey === 'agency-books') {
          sectionKey = 'hero';
          console.log(`🔄 Converted "Agency Books" → "hero"`);
        } else if (sectionKey === 'books-service-overview') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Books Service Overview" → "overview"`);
        } else if (sectionKey === 'books-what-we-offer') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "Books What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'books-what-we-provide') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "Books What We Provide" → "provide"`);
        } else if (sectionKey === 'books-testimonials') {
          sectionKey = 'testimonials';
          console.log(`🔄 Converted "Books Testimonials" → "testimonials"`);
        }
        
        // Connect sections (new unique IDs)
        if (sectionKey === 'agency-connect') {
          sectionKey = 'hero';
          console.log(`🔄 Converted "Agency Connect" → "hero"`);
        } else if (sectionKey === 'connect-service-overview') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Connect Service Overview" → "overview"`);
        } else if (sectionKey === 'connect-what-we-offer') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "Connect What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'connect-what-we-provide') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "Connect What We Provide" → "provide"`);
        } else if (sectionKey === 'connect-testimonials') {
          sectionKey = 'testimonials';
          console.log(`🔄 Converted "Connect Testimonials" → "testimonials"`);
        }
        
        // Verify sections (new unique IDs)
        if (sectionKey === 'agency-verify') {
          sectionKey = 'hero';
          console.log(`🔄 Converted "Agency Verify" → "hero"`);
        } else if (sectionKey === 'verify-service-overview') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Verify Service Overview" → "overview"`);
        } else if (sectionKey === 'verify-what-we-offer') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "Verify What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'verify-what-we-provide') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "Verify What We Provide" → "provide"`);
        } else if (sectionKey === 'verify-testimonials') {
          sectionKey = 'testimonials';
          console.log(`🔄 Converted "Verify Testimonials" → "testimonials"`);
        } else if (sectionKey === 'service-overview' && activePage === 'services/tvg-verify') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Service Overview" → "overview"`);
        } else if (sectionKey === 'what-we-offer' && activePage === 'services/tvg-verify') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'what-we-provide' && activePage === 'services/tvg-verify') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "What We Provide" → "provide"`);
        } else if (sectionKey === 'testimonials' && activePage === 'services/tvg-verify') {
          sectionKey = 'testimonials';
          console.log(`🔄 Converted "Testimonials" → "testimonials"`);
        }
        
        // Reporting sections (new unique IDs)
        if (sectionKey === 'agency-reporting') {
          sectionKey = 'hero';
          console.log(`🔄 Converted "Agency Reporting" → "hero"`);
        } else if (sectionKey === 'reporting-service-overview') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Reporting Service Overview" → "overview"`);
        } else if (sectionKey === 'reporting-what-we-offer') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "Reporting What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'reporting-what-we-provide') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "Reporting What We Provide" → "provide"`);
        } else if (sectionKey === 'reporting-testimonials') {
          sectionKey = 'testimonials';
          console.log(`🔄 Converted "Reporting Testimonials" → "testimonials"`);
        } else if (sectionKey === 'service-overview' && activePage === 'services/tvg-reporting') {
          sectionKey = 'overview';
          console.log(`🔄 Converted "Service Overview" → "overview"`);
        } else if (sectionKey === 'what-we-offer' && activePage === 'services/tvg-reporting') {
          sectionKey = 'tvgEffect';
          console.log(`🔄 Converted "What We Offer" → "tvgEffect"`);
        } else if (sectionKey === 'what-we-provide' && activePage === 'services/tvg-reporting') {
          sectionKey = 'provide';
          console.log(`🔄 Converted "What We Provide" → "provide"`);
        } else if (sectionKey === 'testimonials' && activePage === 'services/tvg-reporting') {
          sectionKey = 'testimonials';
          console.log(`🔄 Converted "Testimonials" → "testimonials"`);
        }
      }

      // Handle special cases for Contact page sections
      if (activePage === 'contact') {
        if (sectionKey === 'start-your-journey') {
          sectionKey = 'contactHero';
          console.log(`🔄 Contact section: "Start Your Journey" → "contactHero"`);
        } else if (sectionKey === 'contact-us') {
          sectionKey = 'contactUsForm';
          console.log(`🔄 Contact section: "Contact Us" → "contactUsForm"`);
        }
      }
      
      console.log(`🔄 Saving with sectionKey: ${sectionKey}`);
      
      // Call the patch API
      const result = await sectionAPI.updateSection(
        pageSlug,
        sectionKey,
        updatedData,
        imageFile,
        imageFieldPath
      );

      // Update local state with new data
      setCmsData((prev) => ({
        ...prev,
        [pageSlug]: {
          ...prev[pageSlug],
          sections: prev[pageSlug]?.sections?.map((s) =>
            s.sectionKey === sectionKey ? { ...s, content: result.data?.content || updatedData } : s
          ),
        },
      }));

      toast.success(`✅ Saved ${activeId} successfully!`);
    } catch (error) {
      console.error("❌ Failed to save section:", error);
      toast.error(`Failed to save ${activeId}: ${error.message}`);
    }
  };

  // Helper to find specific section data from your state
  // Dynamically get section data based on activePage and activeId
  const activeSectionData = (() => {
    console.log('📊 activeSectionData calculation:');
    console.log('   activePage:', activePage);
    console.log('   activeId:', activeId);
    console.log('   cmsData keys:', Object.keys(cmsData));
    console.log('   cmsData[activePage]:', cmsData[activePage]);
    
    const pageData = cmsData[activePage];
    
    if (!pageData || !pageData.sections) {
      console.log(`❌ No page data found for: ${activePage}`);
      console.log('   pageData:', pageData);
      console.log('   pageData?.sections:', pageData?.sections);
      return {};
    }

    // Convert activeId to match sectionKey format in database
    let sectionKey = activeId.toLowerCase().replace(/\s+/g, '-');
    
    console.log(`🔵 activeSectionData: Converting activeId "${activeId}" → sectionKey "${sectionKey}" for page "${activePage}"`);
    
    // For about page, strip the "about-" prefix since DB stores just the base name
    if (activePage === 'about' && sectionKey.startsWith('about-')) {
      sectionKey = sectionKey.replace('about-', '');
    }

    // Handle special case: "Team" button maps to "leadership_team" sectionKey
    if (sectionKey === 'team') {
      sectionKey = 'leadership_team';
    }

    // Handle special case: "Testimonials" in about maps to "testimonials"
    if (activePage === 'about' && sectionKey === 'testimonials') {
      sectionKey = 'testimonials';
    }

    // Handle special cases for Services page sections
    if (activePage === 'services') {
      if (sectionKey === 'a-support-company') {
        sectionKey = 'services-hero';
        console.log(`🔄 Converted "A Support Company" → "services-hero"`);
      } else if (sectionKey === 'all-service') {
        sectionKey = 'services-grid';
        console.log(`🔄 Converted "All Service" → "services-grid"`);
      }
    }

    // Handle special cases for service subpages (TVG services)
    if (activePage && (activePage.startsWith('tvg-') || activePage.includes('tvg-'))) {
      // Management sections
      if (sectionKey === 'agency-management') {
        sectionKey = 'hero';
        console.log(`🔄 Converted "Agency Management" → "hero"`);
      } else if (sectionKey === 'service-overview') {
        sectionKey = 'overview';
        console.log(`🔄 Converted "Service Overview" → "overview"`);
      } else if (sectionKey === 'what-we-offer') {
        sectionKey = 'tvgEffect';
        console.log(`🔄 Converted "What We Offer" → "tvgEffect"`);
      } else if (sectionKey === 'what-we-provide') {
        sectionKey = 'provide';
        console.log(`🔄 Converted "What We Provide" → "provide"`);
      }
      
      // Stream sections (new unique IDs)
      if (sectionKey === 'agency-stream') {
        sectionKey = 'hero';
        console.log(`🔄 Converted "Agency Stream" → "hero"`);
      } else if (sectionKey === 'stream-service-overview') {
        sectionKey = 'overview';
        console.log(`🔄 Converted "Stream Service Overview" → "overview"`);
      } else if (sectionKey === 'stream-what-we-offer') {
        sectionKey = 'tvgEffect';
        console.log(`🔄 Converted "Stream What We Offer" → "tvgEffect"`);
      } else if (sectionKey === 'stream-what-we-provide') {
        sectionKey = 'provide';
        console.log(`🔄 Converted "Stream What We Provide" → "provide"`);
      } else if (sectionKey === 'stream-testimonials') {
        sectionKey = 'testimonials';
        console.log(`🔄 Converted "Stream Testimonials" → "testimonials"`);
      }
      
      // Books sections (new unique IDs)
      if (sectionKey === 'agency-books') {
        sectionKey = 'hero';
        console.log(`🔄 Converted "Agency Books" → "hero"`);
      } else if (sectionKey === 'books-service-overview') {
        sectionKey = 'overview';
        console.log(`🔄 Converted "Books Service Overview" → "overview"`);
      } else if (sectionKey === 'books-what-we-offer') {
        sectionKey = 'tvgEffect';
        console.log(`🔄 Converted "Books What We Offer" → "tvgEffect"`);
      } else if (sectionKey === 'books-what-we-provide') {
        sectionKey = 'provide';
        console.log(`🔄 Converted "Books What We Provide" → "provide"`);
      } else if (sectionKey === 'books-testimonials') {
        sectionKey = 'testimonials';
        console.log(`🔄 Converted "Books Testimonials" → "testimonials"`);
      }
      
      // Connect sections (new unique IDs)
      if (sectionKey === 'agency-connect') {
        sectionKey = 'hero';
        console.log(`🔄 Converted "Agency Connect" → "hero"`);
      } else if (sectionKey === 'connect-service-overview') {
        sectionKey = 'overview';
        console.log(`🔄 Converted "Connect Service Overview" → "overview"`);
      } else if (sectionKey === 'connect-what-we-offer') {
        sectionKey = 'tvgEffect';
        console.log(`🔄 Converted "Connect What We Offer" → "tvgEffect"`);
      } else if (sectionKey === 'connect-what-we-provide') {
        sectionKey = 'provide';
        console.log(`🔄 Converted "Connect What We Provide" → "provide"`);
      } else if (sectionKey === 'connect-testimonials') {
        sectionKey = 'testimonials';
        console.log(`🔄 Converted "Connect Testimonials" → "testimonials"`);
      }
      
      // Verify sections (new unique IDs)
      if (sectionKey === 'agency-verify') {
        sectionKey = 'hero';
        console.log(`🔄 Converted "Agency Verify" → "hero"`);
      } else if (sectionKey === 'service-overview' && activePage === 'services/tvg-verify') {
        sectionKey = 'overview';
        console.log(`🔄 Converted "Service Overview" → "overview"`);
      } else if (sectionKey === 'what-we-offer' && activePage === 'services/tvg-verify') {
        sectionKey = 'tvgEffect';
        console.log(`🔄 Converted "What We Offer" → "tvgEffect"`);
      } else if (sectionKey === 'what-we-provide' && activePage === 'services/tvg-verify') {
        sectionKey = 'provide';
        console.log(`🔄 Converted "What We Provide" → "provide"`);
      } else if (sectionKey === 'testimonials' && activePage === 'services/tvg-verify') {
        sectionKey = 'testimonials';
        console.log(`🔄 Converted "Testimonials" → "testimonials"`);
      }
      
      // Reporting sections (new unique IDs)
      if (sectionKey === 'agency-reporting') {
        sectionKey = 'hero';
        console.log(`🔄 Converted "Agency Reporting" → "hero"`);
      } else if (sectionKey === 'service-overview' && activePage === 'services/tvg-reporting') {
        sectionKey = 'overview';
        console.log(`🔄 Converted "Service Overview" → "overview"`);
      } else if (sectionKey === 'what-we-offer' && activePage === 'services/tvg-reporting') {
        sectionKey = 'tvgEffect';
        console.log(`🔄 Converted "What We Offer" → "tvgEffect"`);
      } else if (sectionKey === 'what-we-provide' && activePage === 'services/tvg-reporting') {
        sectionKey = 'provide';
        console.log(`🔄 Converted "What We Provide" → "provide"`);
      } else if (sectionKey === 'testimonials' && activePage === 'services/tvg-reporting') {
        sectionKey = 'testimonials';
        console.log(`🔄 Converted "Testimonials" → "testimonials"`);
      }
    }

    // Handle special cases for Contact page sections
    if (activePage === 'contact') {
      if (sectionKey === 'start-your-journey') {
        sectionKey = 'contactHero';
        console.log(`🔄 Contact section: "Start Your Journey" → "contactHero"`);
      } else if (sectionKey === 'contact-us') {
        sectionKey = 'contactUsForm';
        console.log(`🔄 Contact section: "Contact Us" → "contactUsForm"`);
      }
    }
    
    const availableSections = pageData.sections.map(s => ({
      sectionKey: s.sectionKey,
      id: s.id,
      name: s.name,
      hasContent: !!s.content,
      contentKeys: s.content ? Object.keys(s.content) : []
    }));
    
    console.log(`🔍 Looking for section:`, {
      activePage,
      activeId,
      sectionKey,
      availableSections
    });
    
    const section = pageData.sections.find((s) => 
      s.sectionKey === sectionKey || 
      s.sectionKey === activeId.toLowerCase() ||
      s.id === activeId || 
      s.name === activeId
    );

    if (section?.content) {
      console.log(`✅ Found section data for ${activeId}:`, section.content);
      console.log(`📊 Content structure:`, {
        keys: Object.keys(section.content),
        isEmpty: Object.keys(section.content).length === 0,
        fullContent: section.content
      });
      console.log(`🔑 Looking for tagsLeft/tagsRight in section.content:`, {
        tagsLeft: section.content?.tagsLeft,
        tagsRight: section.content?.tagsRight
      });
    } else {
      console.log(`⚠️ No content found for section ${activeId}`);
      console.log(`📋 Available sections:`, pageData.sections.map(s => ({
        sectionKey: s.sectionKey,
        hasContent: !!s.content,
        contentKeys: s.content ? Object.keys(s.content) : []
      })));
    }

    return section?.content || {};
  })();

  // Show loading state
  if (loading) {
    return <LoadingScreen message="Loading CMS data..." />;
  }

  return (
    <div className="flex min-h-screen bg-[#05080a] text-white p-6 gap-6 font-manrope">
      {/* --- SIDEBAR (Hardcoded as we discussed) --- */}
      <aside className="w-80 flex flex-col gap-4 sticky top-6">
        {/* --- SIDEBAR --- */}
        <div className="w-80 flex flex-col gap-4 sticky top-6">
          <div className="bg-[#0a0f14]/80 border border-gray-800 rounded-[30px] p-6 h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between gap-3 px-2 mb-8 border-b border-gray-800 pb-6">
              <div className="flex items-center gap-3">
                <img src="/icon2.png" alt="Logo" className="w-8 h-8" />
                <h2 className="text-lg font-bold text-white">
                  The Varallo Group
                </h2>
              </div>
             
            </div>

            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 px-2">
              Main Pages
            </p>

            {/* Homepage Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("home")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "home"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineHome className="text-xl" />
                  <span className="text-sm font-bold uppercase">Home</span>
                </div>
                {openMenu === "home" ? <HiChevronDown /> : <HiChevronRight />}
              </button>
              {openMenu === "home" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    "Hero",
                    "Experience",
                    "Services",
                    "Trust",
                    "Capabilities",
                    "Testimonials",
                  ].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setActivePage("home");
                        setActiveId(sec);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec && activePage === "home"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Aboutpage Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("about")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "about"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineUserGroup className="text-xl" />
                  <span className="text-sm font-bold uppercase">About</span>
                </div>
                {openMenu === "about" ? <HiChevronDown /> : <HiChevronRight />}
              </button>
              {openMenu === "about" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    "About-Hero",
                    "Vision",
                    "Mission",
                    "Journey",
                    "Founder",
                    "Team",
                    "Testimonials",
                  ].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        console.log(`📌 Clicked About section: ${sec}`);
                        setActivePage("about");
                        setActiveId(sec);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec && activePage === "about"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Servicepage Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("service")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "services"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineViewGrid className="text-xl" />
                  <span className="text-sm font-bold uppercase">Service</span>
                </div>
                {openMenu === "service" ? <HiChevronDown /> : <HiChevronRight />}
              </button>
              {openMenu === "service" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    "A Support Company",
                    "All Service",
                    "Testimonials",
                  ].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setActivePage("services");
                        setActiveId(sec);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec && activePage === "services"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              )}
            </div>

              {/* Contact page Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("contact")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "contact"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineMail className="text-xl" />
                  <span className="text-sm font-bold uppercase">Contact</span>
                </div>
                {openMenu === "contact" ? <HiChevronDown /> : <HiChevronRight />}
              </button>
              {openMenu === "contact" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    "Start Your Journey",
                    "Contact Us",
                  ].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setActivePage("contact");
                        setActiveId(sec);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec && activePage === "contact"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              )}
            </div>

 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 mt-5 px-2">
              Service Details
            </p>

            {/* Management Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("management")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  (activePage && activePage.startsWith('tvg-'))
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineBriefcase className="text-xl" />
                  <span className="text-sm font-bold uppercase">
                    Management
                  </span>
                </div>
                {openMenu === "management" ? (
                  <HiChevronDown />
                ) : (
                  <HiChevronRight />
                )}
              </button>
              {openMenu === "management" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    "Agency Management",
                    "Service Overview",
                    "What We Offer",
                    "What We Provide",
                    "Testimonials",
                  ].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setActivePage("tvg-management");
                        setActiveId(sec);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec &&
                        activePage === "tvg-management"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Stream Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("stream")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "services/tvg-stream"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlinePlay className="text-xl" />
                  <span className="text-sm font-bold uppercase">
                    Stream
                  </span>
                </div>
                {openMenu === "stream" ? (
                  <HiChevronDown />
                ) : (
                  <HiChevronRight />
                )}
              </button>
              {openMenu === "stream" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    { label: "Agency Stream", id: "Agency Stream" },
                    { label: "Service Overview", id: "Stream Service Overview" },
                    { label: "What We Offer", id: "Stream What We Offer" },
                    { label: "What We Provide", id: "Stream What We Provide" },
                    { label: "Testimonials", id: "Stream Testimonials" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActivePage("services/tvg-stream");
                        setActiveId(sec.id);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec.id &&
                        activePage === "services/tvg-stream"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              )}
            </div>



            {/* Books Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("books")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "services/tvg-books"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineBookOpen className="text-xl" />
                  <span className="text-sm font-bold uppercase">
                    Books
                  </span>
                </div>
                {openMenu === "books" ? (
                  <HiChevronDown />
                ) : (
                  <HiChevronRight />
                )}
              </button>
              {openMenu === "books" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    { label: "Agency Books", id: "Agency Books" },
                    { label: "Service Overview", id: "Books Service Overview" },
                    { label: "What We Offer", id: "Books What We Offer" },
                    { label: "What We Provide", id: "Books What We Provide" },
                    { label: "Testimonials", id: "Books Testimonials" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActivePage("services/tvg-books");
                        setActiveId(sec.id);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec.id &&
                        activePage === "services/tvg-books"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Connect Toggle */}


            <div className="mb-2">
              <button
                onClick={() => toggle("connect")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "services/tvg-connect"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineShare className="text-xl" />
                  <span className="text-sm font-bold uppercase">
                    Connect
                  </span>
                </div>
                {openMenu === "connect" ? (
                  <HiChevronDown />
                ) : (
                  <HiChevronRight />
                )}
              </button>
              {openMenu === "connect" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    { label: "Agency Connect", id: "Agency Connect" },
                    { label: "Service Overview", id: "Connect Service Overview" },
                    { label: "What We Offer", id: "Connect What We Offer" },
                    { label: "What We Provide", id: "Connect What We Provide" },
                    { label: "Testimonials", id: "Connect Testimonials" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActivePage("services/tvg-connect");
                        setActiveId(sec.id);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec.id &&
                        activePage === "services/tvg-connect"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Verify Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("verify")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "services/tvg-verify"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineShieldCheck className="text-xl" />
                  <span className="text-sm font-bold uppercase">
                    Verify
                  </span>
                </div>
                {openMenu === "verify" ? (
                  <HiChevronDown />
                ) : (
                  <HiChevronRight />
                )}
              </button>
              {openMenu === "verify" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    { label: "Agency Verify", id: "Agency Verify" },
                    { label: "Service Overview", id: "Verify Service Overview" },
                    { label: "What We Offer", id: "Verify What We Offer" },
                    { label: "What We Provide", id: "Verify What We Provide" },
                    { label: "Testimonials", id: "Verify Testimonials" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActivePage("services/tvg-verify");
                        setActiveId(sec.id);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec.id &&
                        activePage === "services/tvg-verify"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Reporting Toggle */}
            <div className="mb-2">
              <button
                onClick={() => toggle("reporting")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                  activePage === "services/tvg-reporting"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "text-gray-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiOutlineChartBar className="text-xl" />
                  <span className="text-sm font-bold uppercase">
                    Reporting
                  </span>
                </div>
                {openMenu === "reporting" ? (
                  <HiChevronDown />
                ) : (
                  <HiChevronRight />
                )}
              </button>
              {openMenu === "reporting" && (
                <div className="ml-9 mt-2 flex flex-col gap-1 border-l border-gray-800">
                  {[
                    { label: "Agency Reporting", id: "Agency Reporting" },
                    { label: "Service Overview", id: "Reporting Service Overview" },
                    { label: "What We Offer", id: "Reporting What We Offer" },
                    { label: "What We Provide", id: "Reporting What We Provide" },
                    { label: "Testimonials", id: "Reporting Testimonials" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActivePage("services/tvg-reporting");
                        setActiveId(sec.id);
                      }}
                      className={`text-left px-4 py-2 text-xs font-medium transition-all ${
                        activeId === sec.id &&
                        activePage === "services/tvg-reporting"
                          ? "text-cyan-400 border-l-2 border-cyan-400 -ml-[2px]"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media Library Button */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <button
                onClick={() => setMediaLibraryOpen(true)}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 transition font-bold uppercase text-sm"
              >
                <HiOutlineDatabase className="text-xl" />
                 Media Library
              </button>

              {/* Contact Submissions Button */}
              <button
                onClick={() => {
                  setActivePage("admin");
                  setActiveId("Contact Submissions");
                }}
                className="w-full mt-3 flex items-center justify-center gap-3 p-3 rounded-xl border bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 transition font-bold uppercase text-sm"
              >
                <HiOutlineInbox className="text-xl" />
                Submissions
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-3 flex items-center justify-center gap-3 p-3 rounded-xl border bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 transition font-bold uppercase text-sm"
              >
                <HiOutlineLogout className="text-xl" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaLibraryOpen}
        onClose={() => {
          setMediaLibraryOpen(false);
          setMediaMode("view");
          setCurrentImageFieldName(null);
        }}
        mode={mediaMode}
        onSelectImage={(url) => {
          navigator.clipboard.writeText(url);
          toast.success("Image URL copied to clipboard!");
        }}
        onImageSelect={handleImageSelected}
      />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <header className="flex items-center justify-between bg-[#0a0f14]/80 border border-gray-800 rounded-[30px] px-8 py-4">
          <h1 className="text-xl font-bold uppercase">
            Editing: <span className="text-cyan-400">{activeId}</span>
          </h1>
        </header>

        <div className="flex-1 bg-[#0a0f14]/80 border border-gray-800 rounded-[40px] p-10 overflow-y-auto custom-scrollbar">
          {/* 3. The magic happens here: the dashboard swaps the component based on activeId */}
          <div key={`${activePage}-${activeId}`}>{renderActiveEditor()}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; -->






























