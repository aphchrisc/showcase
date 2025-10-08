import React, { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp, CheckCircle, AlertTriangle, Calendar, Building2, Recycle, BarChart3, Download, FileText, X, Target, Info, ArrowUp, ArrowDown, Clock, Users, Filter, Layers, Hash } from 'lucide-react';

const ConstructionWasteDashboard = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [timeRange, setTimeRange] = useState({ start: 2020, end: 2024 });
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showCouncilDistricts, setShowCouncilDistricts] = useState(false);
  const [showZipCodes, setShowZipCodes] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  // Updated data based on team feedback
  const currentDiversionRate = 76.4; // % of waste diverted (tons basis)
  const targetDiversionRate = 80; // Team's target
  const totalTonsDiverted = 15720;
  const totalTonsAcceptable = 20576; // Denominator for % calculation
  const totalProjects = 142;
  const totalProjectsInCity = 156;
  const complianceRate = 87;
  const lastUpdated = new Date('2024-10-07T14:30:00');

  // Historical data (2018-2024, default view post-2020)
  const allHistoricalData = [
    // 2018 data
    { year: 2018, month: 'Jan', monthNum: 1, rate: 52, tonnage: 890, acceptable: 1710 },
    { year: 2018, month: 'Feb', monthNum: 2, rate: 54, tonnage: 920, acceptable: 1700 },
    { year: 2018, month: 'Mar', monthNum: 3, rate: 53, tonnage: 1050, acceptable: 1980 },
    { year: 2018, month: 'Apr', monthNum: 4, rate: 55, tonnage: 980, acceptable: 1780 },
    { year: 2018, month: 'May', monthNum: 5, rate: 56, tonnage: 1120, acceptable: 2000 },
    { year: 2018, month: 'Jun', monthNum: 6, rate: 55, tonnage: 1080, acceptable: 1960 },
    { year: 2018, month: 'Jul', monthNum: 7, rate: 57, tonnage: 1150, acceptable: 2020 },
    { year: 2018, month: 'Aug', monthNum: 8, rate: 58, tonnage: 1200, acceptable: 2070 },
    { year: 2018, month: 'Sep', monthNum: 9, rate: 56, tonnage: 1100, acceptable: 1960 },
    { year: 2018, month: 'Oct', monthNum: 10, rate: 57, tonnage: 1140, acceptable: 2000 },
    { year: 2018, month: 'Nov', monthNum: 11, rate: 58, tonnage: 1160, acceptable: 2000 },
    { year: 2018, month: 'Dec', monthNum: 12, rate: 59, tonnage: 1180, acceptable: 2000 },
    // 2019 data
    { year: 2019, month: 'Jan', monthNum: 1, rate: 60, tonnage: 1200, acceptable: 2000 },
    { year: 2019, month: 'Feb', monthNum: 2, rate: 61, tonnage: 1160, acceptable: 1900 },
    { year: 2019, month: 'Mar', monthNum: 3, rate: 62, tonnage: 1300, acceptable: 2100 },
    { year: 2019, month: 'Apr', monthNum: 4, rate: 61, tonnage: 1220, acceptable: 2000 },
    { year: 2019, month: 'May', monthNum: 5, rate: 63, tonnage: 1390, acceptable: 2200 },
    { year: 2019, month: 'Jun', monthNum: 6, rate: 62, tonnage: 1340, acceptable: 2160 },
    { year: 2019, month: 'Jul', monthNum: 7, rate: 64, tonnage: 1440, acceptable: 2250 },
    { year: 2019, month: 'Aug', monthNum: 8, rate: 65, tonnage: 1500, acceptable: 2310 },
    { year: 2019, month: 'Sep', monthNum: 9, rate: 63, tonnage: 1380, acceptable: 2190 },
    { year: 2019, month: 'Oct', monthNum: 10, rate: 64, tonnage: 1410, acceptable: 2200 },
    { year: 2019, month: 'Nov', monthNum: 11, rate: 65, tonnage: 1430, acceptable: 2200 },
    { year: 2019, month: 'Dec', monthNum: 12, rate: 66, tonnage: 1450, acceptable: 2200 },
    // 2020 data (default start)
    { year: 2020, month: 'Jan', monthNum: 1, rate: 67, tonnage: 1340, acceptable: 2000 },
    { year: 2020, month: 'Feb', monthNum: 2, rate: 66, tonnage: 1260, acceptable: 1910 },
    { year: 2020, month: 'Mar', monthNum: 3, rate: 65, tonnage: 1300, acceptable: 2000 },
    { year: 2020, month: 'Apr', monthNum: 4, rate: 63, tonnage: 1140, acceptable: 1810 },
    { year: 2020, month: 'May', monthNum: 5, rate: 68, tonnage: 1430, acceptable: 2100 },
    { year: 2020, month: 'Jun', monthNum: 6, rate: 69, tonnage: 1520, acceptable: 2200 },
    { year: 2020, month: 'Jul', monthNum: 7, rate: 70, tonnage: 1610, acceptable: 2300 },
    { year: 2020, month: 'Aug', monthNum: 8, rate: 71, tonnage: 1680, acceptable: 2370 },
    { year: 2020, month: 'Sep', monthNum: 9, rate: 70, tonnage: 1540, acceptable: 2200 },
    { year: 2020, month: 'Oct', monthNum: 10, rate: 71, tonnage: 1560, acceptable: 2200 },
    { year: 2020, month: 'Nov', monthNum: 11, rate: 72, tonnage: 1580, acceptable: 2190 },
    { year: 2020, month: 'Dec', monthNum: 12, rate: 73, tonnage: 1600, acceptable: 2190 },
    // 2021-2024 data
    { year: 2021, month: 'Jan', monthNum: 1, rate: 73, tonnage: 1460, acceptable: 2000 },
    { year: 2021, month: 'Feb', monthNum: 2, rate: 72, tonnage: 1370, acceptable: 1900 },
    { year: 2021, month: 'Mar', monthNum: 3, rate: 74, tonnage: 1550, acceptable: 2095 },
    { year: 2021, month: 'Apr', monthNum: 4, rate: 73, tonnage: 1460, acceptable: 2000 },
    { year: 2021, month: 'May', monthNum: 5, rate: 75, tonnage: 1650, acceptable: 2200 },
    { year: 2021, month: 'Jun', monthNum: 6, rate: 74, tonnage: 1590, acceptable: 2150 },
    { year: 2021, month: 'Jul', monthNum: 7, rate: 76, tonnage: 1710, acceptable: 2250 },
    { year: 2021, month: 'Aug', monthNum: 8, rate: 77, tonnage: 1790, acceptable: 2325 },
    { year: 2021, month: 'Sep', monthNum: 9, rate: 75, tonnage: 1650, acceptable: 2200 },
    { year: 2021, month: 'Oct', monthNum: 10, rate: 76, tonnage: 1670, acceptable: 2200 },
    { year: 2021, month: 'Nov', monthNum: 11, rate: 77, tonnage: 1690, acceptable: 2195 },
    { year: 2021, month: 'Dec', monthNum: 12, rate: 78, tonnage: 1710, acceptable: 2192 },
    { year: 2022, month: 'Jan', monthNum: 1, rate: 74, tonnage: 1480, acceptable: 2000 },
    { year: 2022, month: 'Feb', monthNum: 2, rate: 75, tonnage: 1425, acceptable: 1900 },
    { year: 2022, month: 'Mar', monthNum: 3, rate: 76, tonnage: 1596, acceptable: 2100 },
    { year: 2022, month: 'Apr', monthNum: 4, rate: 75, tonnage: 1500, acceptable: 2000 },
    { year: 2022, month: 'May', monthNum: 5, rate: 77, tonnage: 1694, acceptable: 2200 },
    { year: 2022, month: 'Jun', monthNum: 6, rate: 76, tonnage: 1642, acceptable: 2160 },
    { year: 2022, month: 'Jul', monthNum: 7, rate: 78, tonnage: 1755, acceptable: 2250 },
    { year: 2022, month: 'Aug', monthNum: 8, rate: 79, tonnage: 1825, acceptable: 2310 },
    { year: 2022, month: 'Sep', monthNum: 9, rate: 77, tonnage: 1686, acceptable: 2190 },
    { year: 2022, month: 'Oct', monthNum: 10, rate: 78, tonnage: 1716, acceptable: 2200 },
    { year: 2022, month: 'Nov', monthNum: 11, rate: 79, tonnage: 1738, acceptable: 2200 },
    { year: 2022, month: 'Dec', monthNum: 12, rate: 80, tonnage: 1760, acceptable: 2200 },
    { year: 2023, month: 'Jan', monthNum: 1, rate: 76, tonnage: 1520, acceptable: 2000 },
    { year: 2023, month: 'Feb', monthNum: 2, rate: 77, tonnage: 1463, acceptable: 1900 },
    { year: 2023, month: 'Mar', monthNum: 3, rate: 78, tonnage: 1638, acceptable: 2100 },
    { year: 2023, month: 'Apr', monthNum: 4, rate: 77, tonnage: 1540, acceptable: 2000 },
    { year: 2023, month: 'May', monthNum: 5, rate: 79, tonnage: 1738, acceptable: 2200 },
    { year: 2023, month: 'Jun', monthNum: 6, rate: 78, tonnage: 1685, acceptable: 2160 },
    { year: 2023, month: 'Jul', monthNum: 7, rate: 80, tonnage: 1800, acceptable: 2250 },
    { year: 2023, month: 'Aug', monthNum: 8, rate: 81, tonnage: 1871, acceptable: 2310 },
    { year: 2023, month: 'Sep', monthNum: 9, rate: 79, tonnage: 1730, acceptable: 2190 },
    { year: 2023, month: 'Oct', monthNum: 10, rate: 80, tonnage: 1760, acceptable: 2200 },
    { year: 2023, month: 'Nov', monthNum: 11, rate: 81, tonnage: 1782, acceptable: 2200 },
    { year: 2023, month: 'Dec', monthNum: 12, rate: 82, tonnage: 1804, acceptable: 2200 },
    { year: 2024, month: 'Jan', monthNum: 1, rate: 78, tonnage: 1560, acceptable: 2000 },
    { year: 2024, month: 'Feb', monthNum: 2, rate: 77, tonnage: 1463, acceptable: 1900 },
    { year: 2024, month: 'Mar', monthNum: 3, rate: 79, tonnage: 1659, acceptable: 2100 },
    { year: 2024, month: 'Apr', monthNum: 4, rate: 76, tonnage: 1520, acceptable: 2000 },
    { year: 2024, month: 'May', monthNum: 5, rate: 78, tonnage: 1716, acceptable: 2200 },
    { year: 2024, month: 'Jun', monthNum: 6, rate: 77, tonnage: 1663, acceptable: 2160 },
    { year: 2024, month: 'Jul', monthNum: 7, rate: 79, tonnage: 1778, acceptable: 2250 },
    { year: 2024, month: 'Aug', monthNum: 8, rate: 78, tonnage: 1802, acceptable: 2310 },
    { year: 2024, month: 'Sep', monthNum: 9, rate: 77, tonnage: 1686, acceptable: 2190 },
    { year: 2024, month: 'Oct', monthNum: 10, rate: 76.4, tonnage: 1681, acceptable: 2200 }
  ];

  // Filter data based on time range
  const filteredData = allHistoricalData.filter(d => 
    d.year >= timeRange.start && d.year <= timeRange.end
  );

  // Materials extracted from checkbox survey data
  const availableMaterials = [
    'Concrete', 'Wood', 'Metal', 'Drywall', 'Asphalt', 'Carpet/Flooring', 
    'Cardboard', 'Plastics', 'Glass', 'Masonry', 'Roofing', 'Insulation'
  ];

  // Material selection data (extracted from survey checkboxes)
  // Note: Contractors report total tonnage + which materials were included (multi-select)
  // They do NOT report individual quantities per material type
  const materialBreakdown = [
    { material: 'Concrete', projects: 89, contractors: 12, avgDiversion: 82 },
    { material: 'Metal', projects: 67, contractors: 15, avgDiversion: 88 },
    { material: 'Wood', projects: 102, contractors: 18, avgDiversion: 74 },
    { material: 'Drywall', projects: 78, contractors: 14, avgDiversion: 68 },
    { material: 'Asphalt', projects: 45, contractors: 9, avgDiversion: 84 },
    { material: 'Carpet/Flooring', projects: 56, contractors: 11, avgDiversion: 55 },
    { material: 'Cardboard', projects: 94, contractors: 17, avgDiversion: 88 },
    { material: 'Plastics', projects: 52, contractors: 13, avgDiversion: 38 },
    { material: 'Glass', projects: 38, contractors: 8, avgDiversion: 66 },
    { material: 'Masonry', projects: 61, contractors: 10, avgDiversion: 81 },
    { material: 'Roofing', projects: 44, contractors: 9, avgDiversion: 62 },
    { material: 'Insulation', projects: 29, contractors: 7, avgDiversion: 40 }
  ];

  // Projects with additional detail
  const projects = [
    { 
      id: 1, name: 'Downtown Office Tower', lat: 30.268, lng: -97.743, 
      diversion: 85, contractor: 'BuildRight Austin', compliance: 'current', 
      tonnage: 245, acceptableTonnage: 288, projectType: 'New Construction',
      materials: ['Concrete', 'Metal', 'Wood', 'Drywall', 'Glass'],
      zipCode: '78701', councilDistrict: 9
    },
    { 
      id: 2, name: 'East Austin Apartments', lat: 30.264, lng: -97.719,
      diversion: 72, contractor: 'GreenBuild Co', compliance: 'current',
      tonnage: 189, acceptableTonnage: 262, projectType: 'New Construction',
      materials: ['Concrete', 'Wood', 'Drywall', 'Cardboard'],
      zipCode: '78702', councilDistrict: 1
    },
    { 
      id: 3, name: 'South Congress Retail', lat: 30.247, lng: -97.746,
      diversion: 45, contractor: 'QuickBuild LLC', compliance: 'overdue',
      tonnage: 156, acceptableTonnage: 347, projectType: 'Renovation',
      materials: ['Wood', 'Drywall', 'Carpet/Flooring', 'Plastics'],
      zipCode: '78704', councilDistrict: 5
    },
    { 
      id: 4, name: 'North Loop Renovation', lat: 30.315, lng: -97.736,
      diversion: 91, contractor: 'EcoCon Solutions', compliance: 'current',
      tonnage: 98, acceptableTonnage: 108, projectType: 'Renovation',
      materials: ['Wood', 'Metal', 'Drywall', 'Roofing'],
      zipCode: '78751', councilDistrict: 9
    },
    { 
      id: 5, name: 'Westlake Mixed Use', lat: 30.287, lng: -97.804,
      diversion: 67, contractor: 'BuildRight Austin', compliance: 'current',
      tonnage: 312, acceptableTonnage: 466, projectType: 'New Construction',
      materials: ['Concrete', 'Metal', 'Wood', 'Glass', 'Asphalt'],
      zipCode: '78746', councilDistrict: 8
    },
    { 
      id: 6, name: 'Mueller Development Ph3', lat: 30.299, lng: -97.708,
      diversion: 88, contractor: 'GreenBuild Co', compliance: 'current',
      tonnage: 278, acceptableTonnage: 316, projectType: 'New Construction',
      materials: ['Concrete', 'Metal', 'Wood', 'Drywall', 'Masonry'],
      zipCode: '78723', councilDistrict: 4
    },
    { 
      id: 7, name: 'Zilker Area Housing', lat: 30.263, lng: -97.769,
      diversion: 79, contractor: 'EcoCon Solutions', compliance: 'current',
      tonnage: 167, acceptableTonnage: 211, projectType: 'New Construction',
      materials: ['Wood', 'Drywall', 'Roofing', 'Insulation'],
      zipCode: '78704', councilDistrict: 5
    },
    { 
      id: 8, name: 'Airport Blvd Commercial', lat: 30.295, lng: -97.713,
      diversion: 55, contractor: 'QuickBuild LLC', compliance: 'overdue',
      tonnage: 203, acceptableTonnage: 369, projectType: 'Demolition',
      materials: ['Concrete', 'Metal', 'Asphalt', 'Masonry'],
      zipCode: '78722', councilDistrict: 1
    }
  ];

  // Contractors with compliance tracking
  const contractors = [
    { name: 'EcoCon Solutions', projects: 12, avgDiversion: 89, compliance: 100, totalTonnage: 1240 },
    { name: 'GreenBuild Co', projects: 24, avgDiversion: 82, compliance: 96, totalTonnage: 2890 },
    { name: 'BuildRight Austin', projects: 31, avgDiversion: 76, compliance: 87, totalTonnage: 3450 },
    { name: 'Construct Plus', projects: 18, avgDiversion: 73, compliance: 89, totalTonnage: 1680 },
    { name: 'QuickBuild LLC', projects: 28, avgDiversion: 58, compliance: 71, totalTonnage: 2340 },
    { name: 'Heritage Builders', projects: 15, avgDiversion: 69, compliance: 80, totalTonnage: 1420 }
  ];

  // Filter projects by selected contractor and materials
  const getFilteredProjects = () => {
    let filtered = projects;
    
    if (selectedContractor) {
      filtered = filtered.filter(p => p.contractor === selectedContractor);
    }
    
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(p => 
        selectedMaterials.some(m => p.materials.includes(m))
      );
    }
    
    return filtered;
  };

  // Initialize map
  useEffect(() => {
    if (selectedView === 'overview' && mapRef.current && !leafletMapRef.current) {
      const loadLeaflet = async () => {
        if (!window.L) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = initMap;
          document.body.appendChild(script);
        } else {
          initMap();
        }
      };

      const initMap = () => {
        if (leafletMapRef.current) return;

        const map = window.L.map(mapRef.current).setView([30.2672, -97.7431], 11);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add Austin city boundary (simplified GeoJSON from OSM)
        const austinBoundary = {
          type: "Feature",
          properties: { name: "Austin, TX" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-97.9383, 30.5168], [-97.9208, 30.4936], [-97.8858, 30.4654],
              [-97.8333, 30.4373], [-97.7808, 30.4217], [-97.7358, 30.4092],
              [-97.6908, 30.3967], [-97.6533, 30.3842], [-97.6208, 30.3717],
              [-97.5933, 30.3592], [-97.5708, 30.3467], [-97.5533, 30.3342],
              [-97.5408, 30.3217], [-97.5333, 30.3092], [-97.5308, 30.2967],
              [-97.5333, 30.2842], [-97.5408, 30.2717], [-97.5533, 30.2592],
              [-97.5708, 30.2467], [-97.5933, 30.2342], [-97.6208, 30.2217],
              [-97.6533, 30.2092], [-97.6908, 30.1967], [-97.7358, 30.1842],
              [-97.7808, 30.1717], [-97.8333, 30.1592], [-97.8858, 30.1467],
              [-97.9208, 30.1342], [-97.9383, 30.1217], [-97.9508, 30.1142],
              [-97.9583, 30.1092], [-97.9633, 30.1067], [-97.9658, 30.1067],
              [-97.9683, 30.1092], [-97.9708, 30.1142], [-97.9733, 30.1217],
              [-97.9758, 30.1342], [-97.9783, 30.1467], [-97.9808, 30.1592],
              [-97.9833, 30.1717], [-97.9858, 30.1842], [-97.9883, 30.1967],
              [-97.9908, 30.2092], [-97.9933, 30.2217], [-97.9958, 30.2342],
              [-97.9983, 30.2467], [-98.0008, 30.2592], [-98.0033, 30.2717],
              [-98.0058, 30.2842], [-98.0083, 30.2967], [-98.0083, 30.3092],
              [-98.0058, 30.3217], [-98.0033, 30.3342], [-98.0008, 30.3467],
              [-97.9983, 30.3592], [-97.9958, 30.3717], [-97.9933, 30.3842],
              [-97.9908, 30.3967], [-97.9883, 30.4092], [-97.9858, 30.4217],
              [-97.9833, 30.4373], [-97.9808, 30.4654], [-97.9758, 30.4936],
              [-97.9683, 30.5092], [-97.9583, 30.5142], [-97.9508, 30.5168],
              [-97.9383, 30.5168]
            ]]
          }
        };

        // Add boundary as polygon overlay
        window.L.geoJSON(austinBoundary, {
          style: {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.6,
            fillColor: '#3b82f6',
            fillOpacity: 0.05
          }
        }).addTo(map).bindPopup('<strong>Austin City Limits</strong>');

        // Update thresholds per team feedback: >80% green, 61-79% yellow, <61% orange
        const getColor = (rate) => {
          if (rate > 80) return '#10b981'; // Green
          if (rate >= 61) return '#f59e0b'; // Yellow/Orange
          return '#ef4444'; // Red/Orange
        };
        
        const getSymbol = (rate) => {
          if (rate > 80) return '✓';
          if (rate >= 61) return '⚠';
          return '✗';
        };

        getFilteredProjects().forEach(project => {
          const color = getColor(project.diversion);
          const symbol = getSymbol(project.diversion);
          
          const icon = window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 16px;">${symbol}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = window.L.marker([project.lat, project.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 220px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${project.name}</h3>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Type:</strong> ${project.projectType}</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Contractor:</strong> ${project.contractor}</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Diversion Rate:</strong> <span style="color: ${color}; font-weight: bold;">${symbol} ${project.diversion}%</span></p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Total Tons:</strong> ${project.tonnage} of ${project.acceptableTonnage} acceptable</p>
                <p style="margin: 4px 0; font-size: 11px;"><strong>Materials:</strong> ${project.materials.slice(0, 3).join(', ')}${project.materials.length > 3 ? '...' : ''}</p>
                <p style="margin: 4px 0; font-size: 11px;"><strong>ZIP:</strong> ${project.zipCode} | <strong>District:</strong> ${project.councilDistrict}</p>
              </div>
            `);

          marker.on('click', () => {
            setSelectedProject(project);
          });
        });

        leafletMapRef.current = map;
        setMapLoaded(true);
      };

      loadLeaflet();
    }
  }, [selectedView, selectedContractor, selectedMaterials]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
        setShowExportMenu(false);
        setSelectedContractor(null);
      }
      
      if (!selectedProject && !showExportMenu) {
        const views = ['overview', 'contractors', 'materials'];
        const currentIndex = views.indexOf(selectedView);
        
        if (e.key === 'ArrowRight' && currentIndex < views.length - 1) {
          setSelectedView(views[currentIndex + 1]);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setSelectedView(views[currentIndex - 1]);
        }
      }

      if ((e.key === 'e' || e.key === 'E') && !selectedProject && !showExportMenu) {
        e.preventDefault();
        setShowExportMenu(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedView, selectedProject, showExportMenu]);

  const exportToPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    const headers = ['Project Name', 'Type', 'Contractor', 'Diversion %', 'Tons Diverted', 'Acceptable Tons', 'Materials', 'ZIP', 'District', 'Compliance'];
    const rows = projects.map(p => [
      p.name,
      p.projectType,
      p.contractor,
      `${p.diversion}%`,
      p.tonnage,
      p.acceptableTonnage,
      p.materials.join('; '),
      p.zipCode,
      p.councilDistrict,
      p.compliance
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `austin-waste-diversion-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  const getStatusColor = (rate) => {
    if (rate > 80) return 'text-green-600';
    if (rate >= 61) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBg = (rate) => {
    if (rate > 80) return 'bg-green-100';
    if (rate >= 61) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusIcon = (rate) => {
    if (rate > 80) return <CheckCircle className="w-4 h-4" />;
    if (rate >= 61) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const Tooltip = ({ text, children }) => (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );

  const toggleMaterial = (material) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 print:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Recycle className="w-10 h-10 text-green-600 print:w-8 print:h-8" />
              <div>
                <h1 className="text-4xl font-bold text-slate-800 print:text-2xl">Austin C&D Waste Diversion</h1>
                <div className="flex items-center gap-3 text-sm text-slate-600 print:text-xs">
                  <span>Construction & Demolition Waste Recovery Tracking</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated: {lastUpdated.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {totalProjects}/{totalProjectsInCity} projects reporting
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative print:hidden">
              <Tooltip text="Export data (Press 'E')">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Export</span>
                </button>
              </Tooltip>
              
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-slate-200 py-2 min-w-48 z-50">
                  <button
                    onClick={exportToPDF}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export to PDF</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 print:hidden">
          {['overview', 'contractors', 'materials'].map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedView === view
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview View */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* 1. HERO METRIC - Simplified per team feedback */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white print:bg-green-100 print:text-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-8 h-8" />
                    <h2 className="text-lg font-semibold uppercase tracking-wide opacity-90">Current Waste Diversion Rate</h2>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="text-7xl font-bold print:text-5xl">{currentDiversionRate}%</div>
                    <div className="mb-3 text-2xl opacity-90">of {targetDiversionRate}% target</div>
                  </div>
                  <div className="mt-4 text-sm opacity-90">
                    <p className="mb-1">Based on tons of acceptable materials diverted from landfills</p>
                    <p><strong>{totalTonsDiverted.toLocaleString()} tons</strong> diverted of <strong>{totalTonsAcceptable.toLocaleString()} tons</strong> acceptable materials processed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-6 py-3 rounded-lg font-bold text-lg ${
                    currentDiversionRate >= targetDiversionRate 
                      ? 'bg-white text-green-600' 
                      : currentDiversionRate >= targetDiversionRate - 5
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-red-500 text-white'
                  }`}>
                    {currentDiversionRate >= targetDiversionRate ? '✓ Target Met' : 
                     currentDiversionRate >= targetDiversionRate - 5 ? '⚠ Near Target' : '✗ Below Target'}
                  </div>
                  <p className="mt-3 text-sm opacity-90">
                    {currentDiversionRate >= targetDiversionRate 
                      ? `Exceeding target by ${(currentDiversionRate - targetDiversionRate).toFixed(1)}%`
                      : `${(targetDiversionRate - currentDiversionRate).toFixed(1)}% away from target`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* 2. TREND PANEL - Month-over-month with time slider */}
            <div className="bg-white rounded-xl shadow-lg p-6 print:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-800">Diversion Rate Trend</h2>
                  <Tooltip text="Month-over-month percentage of waste diverted (tons basis)">
                    <Info className="w-5 h-5 text-slate-400" />
                  </Tooltip>
                </div>
                
                {/* Time Range Slider */}
                <div className="flex items-center gap-4 print:hidden">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <label className="text-sm font-medium text-slate-600">Time Range:</label>
                  </div>
                  <select 
                    value={`${timeRange.start}-${timeRange.end}`}
                    onChange={(e) => {
                      const [start, end] = e.target.value.split('-').map(Number);
                      setTimeRange({ start, end });
                    }}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="2020-2024">2020-2024 (Default)</option>
                    <option value="2018-2024">2018-2024 (All Data)</option>
                    <option value="2022-2024">2022-2024 (Recent)</option>
                    <option value="2023-2024">2023-2024 (Last 2 Years)</option>
                  </select>
                </div>
              </div>
              
              {/* Timeline/Bar Chart - Fixed Y-axis scaling */}
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 1000 300">
                  {/* Define scale: 50% to 90% visible range */}
                  {/* Grid lines */}
                  {[50, 60, 70, 80, 90].map((val, idx) => {
                    const yPos = 280 - ((val - 50) / 40) * 260; // Map 50-90% to 280-20 px
                    return (
                      <g key={idx}>
                        <line
                          x1="60"
                          y1={yPos}
                          x2="980"
                          y2={yPos}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                        <text
                          x="45"
                          y={yPos}
                          fill="#64748b"
                          fontSize="14"
                          textAnchor="end"
                          dominantBaseline="middle"
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Target line at 80% */}
                  <line
                    x1="60"
                    y1={280 - ((80 - 50) / 40) * 260}
                    x2="980"
                    y2={280 - ((80 - 50) / 40) * 260}
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                  />
                  <text
                    x="970"
                    y={280 - ((80 - 50) / 40) * 260 - 8}
                    fill="#10b981"
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    80% Target
                  </text>
                  
                  {/* Line chart */}
                  <polyline
                    points={filteredData.map((d, i) => {
                      const x = 60 + (i / (filteredData.length - 1)) * 920;
                      const y = 280 - ((d.rate - 50) / 40) * 260;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {filteredData.map((d, i) => {
                    const x = 60 + (i / (filteredData.length - 1)) * 920;
                    const y = 280 - ((d.rate - 50) / 40) * 260;
                    const shouldShowLabel = filteredData.length <= 36 || i % Math.ceil(filteredData.length / 36) === 0;
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#10b981"
                          stroke="white"
                          strokeWidth="2"
                        />
                        {shouldShowLabel && (
                          <text
                            x={x}
                            y="295"
                            fill="#64748b"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            {d.month.substring(0, 1)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Year labels */}
                  {[...new Set(filteredData.map(d => d.year))].map((year, idx) => {
                    const yearData = filteredData.filter(d => d.year === year);
                    const firstMonth = filteredData.indexOf(yearData[0]);
                    const x = 60 + (firstMonth / (filteredData.length - 1)) * 920;
                    return (
                      <text
                        key={year}
                        x={x}
                        y="15"
                        fill="#475569"
                        fontSize="13"
                        fontWeight="bold"
                        textAnchor="start"
                      >
                        {year}
                      </text>
                    );
                  })}
                </svg>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-green-600"></div>
                    <span>Actual Diversion Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-green-600 border-dashed border-t-2"></div>
                    <span>80% Target</span>
                  </div>
                </div>
                <div className="text-slate-500">
                  Showing {filteredData.length} months of data ({timeRange.start}-{timeRange.end})
                </div>
              </div>
            </div>

            {/* 3. MAP PANEL - Projects as dots, color-coded */}
            <div className="bg-white rounded-xl shadow-lg p-6 print:hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-700" />
                  <h2 className="text-xl font-bold text-slate-800">Project Locations</h2>
                  <Tooltip text="Click markers to see project details including type, tonnage, and materials">
                    <Info className="w-5 h-5 text-slate-400" />
                  </Tooltip>
                </div>
                
                {/* Map Overlays */}
                <div className="flex gap-2">
                  <Tooltip text="Toggle Council District boundaries">
                    <button
                      onClick={() => setShowCouncilDistricts(!showCouncilDistricts)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        showCouncilDistricts 
                          ? 'bg-green-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Layers className="w-4 h-4 inline mr-1" />
                      Districts
                    </button>
                  </Tooltip>
                  <Tooltip text="Toggle ZIP code aggregation">
                    <button
                      onClick={() => setShowZipCodes(!showZipCodes)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        showZipCodes 
                          ? 'bg-green-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Hash className="w-4 h-4 inline mr-1" />
                      ZIP Codes
                    </button>
                  </Tooltip>
                </div>
              </div>
              
              <div 
                ref={mapRef} 
                className="rounded-lg h-96 bg-slate-100 relative overflow-hidden"
                style={{ zIndex: 1 }}
              >
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                    Loading map...
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex gap-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-white shadow flex items-center justify-center text-white text-sm font-bold">✓</div>
                    <span>&gt;80% Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow flex items-center justify-center text-white text-sm font-bold">⚠</div>
                    <span>61-79% Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow flex items-center justify-center text-white text-sm font-bold">✗</div>
                    <span>&lt;61% Needs Improvement</span>
                  </div>
                </div>
                {(showCouncilDistricts || showZipCodes) && (
                  <div className="mt-2 text-xs text-slate-600">
                    {showCouncilDistricts && <span className="mr-3">📍 Council District boundaries shown</span>}
                    {showZipCodes && <span>📮 ZIP code aggregation enabled</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedContractor || selectedMaterials.length > 0) && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-700" />
                    <h3 className="font-bold text-blue-900">Active Filters:</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedContractor && (
                        <span className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm font-medium">
                          Contractor: {selectedContractor}
                        </span>
                      )}
                      {selectedMaterials.map(m => (
                        <span key={m} className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm font-medium">
                          Material: {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedContractor(null);
                      setSelectedMaterials([]);
                    }}
                    className="text-blue-700 hover:text-blue-900 font-medium text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. CONTRACTOR VIEW - Stack-ranked with drill-through */}
        {selectedView === 'contractors' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Contractor Performance & Compliance</h2>
                <p className="text-slate-600 text-sm">
                  Stack-ranked by average diversion rate. Click contractor to filter projects on map.
                </p>
              </div>
              
              <div className="space-y-3">
                {contractors
                  .sort((a, b) => b.avgDiversion - a.avgDiversion)
                  .map((contractor, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedContractor(contractor.name)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedContractor === contractor.name
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            idx === 0 ? 'bg-yellow-500' : 
                            idx === 1 ? 'bg-slate-400' : 
                            idx === 2 ? 'bg-amber-700' : 
                            'bg-slate-300 text-slate-700'
                          }`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg">{contractor.name}</h3>
                            <p className="text-sm text-slate-600">{contractor.projects} active projects</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold flex items-center gap-2 ${getStatusColor(contractor.avgDiversion)}`}>
                            {getStatusIcon(contractor.avgDiversion)}
                            {contractor.avgDiversion}%
                          </div>
                          <div className="text-xs text-slate-500">avg diversion</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Compliance Rate</p>
                          <p className="font-bold text-slate-700">{contractor.compliance}%</p>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${contractor.compliance >= 90 ? 'bg-green-500' : contractor.compliance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${contractor.compliance}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Total Tonnage</p>
                          <p className="font-bold text-slate-700">{contractor.totalTonnage.toLocaleString()}t</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Status</p>
                          <p className={`font-bold ${
                            contractor.compliance >= 90 ? 'text-green-600' : 
                            contractor.compliance >= 75 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {contractor.compliance >= 90 ? '✓ Excellent' : 
                             contractor.compliance >= 75 ? '⚠ Good' : 
                             '✗ Needs Attention'}
                          </p>
                        </div>
                      </div>
                      
                      {selectedContractor === contractor.name && (
                        <div className="mt-3 pt-3 border-t border-green-200 bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Filtering map and projects to show only {contractor.name} projects. 
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContractor(null);
                              }}
                              className="ml-2 underline hover:no-underline"
                            >
                              Clear filter
                            </button>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-800">Compliance Alerts</h3>
              </div>
              <p className="text-red-700 text-sm">
                QuickBuild LLC has 8 projects with overdue diversion reports. Automated reminder sent 3 days ago. Follow-up required.
              </p>
            </div>
          </div>
        )}

        {/* 5. MATERIALS FACET - Filter/browse by material */}
        {selectedView === 'materials' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Materials Analysis</h2>
                <p className="text-slate-600 text-sm">
                  Data extracted from survey checkboxes. Click materials to filter projects and contractors.
                </p>
              </div>
              
              {/* Material Selection */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-800">Filter by Material Type:</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableMaterials.map(material => (
                    <button
                      key={material}
                      onClick={() => toggleMaterial(material)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedMaterials.includes(material)
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-green-500'
                      }`}
                    >
                      {material}
                      {selectedMaterials.includes(material) && ' ✓'}
                    </button>
                  ))}
                </div>
                {selectedMaterials.length > 0 && (
                  <button
                    onClick={() => setSelectedMaterials([])}
                    className="mt-3 text-sm text-green-700 hover:text-green-900 font-medium underline"
                  >
                    Clear all material filters
                  </button>
                )}
              </div>
              
              {/* Material Breakdown */}
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-700" />
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Contractors report total project tonnage and select which materials were included (multi-select checkboxes). 
                      Individual material quantities are not tracked. Data below shows which projects included each material type.
                    </p>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-800 mb-4">Projects by Material Type (from checkbox selections)</h3>
                {materialBreakdown.map((item, idx) => {
                  const isSelected = selectedMaterials.length === 0 || selectedMaterials.includes(item.material);
                  
                  return (
                    <div 
                      key={idx}
                      className={`border-2 rounded-lg p-4 transition ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-slate-200 opacity-40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800 text-lg w-40">{item.material}</span>
                          <span className={`text-sm font-semibold ${getStatusColor(item.avgDiversion)}`}>
                            {getStatusIcon(item.avgDiversion)} {item.avgDiversion}% avg diversion
                          </span>
                        </div>
                        <button
                          onClick={() => toggleMaterial(item.material)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            selectedMaterials.includes(item.material)
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {selectedMaterials.includes(item.material) ? '✓ Selected' : 'Select to Filter'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Projects Including This</p>
                          <p className="text-2xl font-bold text-slate-700">{item.projects}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {((item.projects / totalProjects) * 100).toFixed(0)}% of active projects
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Contractors Using This</p>
                          <p className="text-2xl font-bold text-slate-700">{item.contractors}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {((item.contractors / contractors.length) * 100).toFixed(0)}% of contractors
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Avg Performance</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.avgDiversion)}
                            <p className={`text-2xl font-bold ${getStatusColor(item.avgDiversion)}`}>
                              {item.avgDiversion}%
                            </p>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            for projects with this material
                          </p>
                        </div>
                      </div>
                      
                      {selectedMaterials.includes(item.material) && (
                        <div className="mt-3 pt-3 border-t border-green-200 bg-green-100 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Filtering to show only projects that included {item.material}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-2">Understanding Material Data</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Contractors report <strong>total tonnage diverted</strong> per project (e.g., "120 tons")</li>
                  <li>• They then <strong>select which materials</strong> were included via checkboxes</li>
                  <li>• Individual material quantities are <strong>not tracked separately</strong></li>
                  <li>• "Avg Performance" shows the average diversion rate of projects that included each material</li>
                  <li>• Click "Select to Filter" to view only projects containing that material type</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{selectedProject.name}</h3>
                    <p className="text-slate-600">{selectedProject.projectType}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg p-2 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${getStatusBg(selectedProject.diversion)} rounded-lg p-4`}>
                    <p className={`text-sm ${getStatusColor(selectedProject.diversion)} mb-1 font-medium`}>Diversion Rate</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedProject.diversion)}
                      <p className={`text-3xl font-bold ${getStatusColor(selectedProject.diversion)}`}>
                        {selectedProject.diversion}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-1 font-medium">Total Tonnage</p>
                    <p className="text-3xl font-bold text-slate-800">{selectedProject.tonnage}t</p>
                    <p className="text-xs text-slate-600 mt-1">of {selectedProject.acceptableTonnage}t acceptable</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Contractor</p>
                  <p className="text-slate-700 font-medium">{selectedProject.contractor}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Selected Materials (from survey)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.materials.map(m => (
                      <span key={m} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">Location</p>
                    <p className="text-slate-700">ZIP Code: {selectedProject.zipCode}</p>
                    <p className="text-slate-700">Council District: {selectedProject.councilDistrict}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">Compliance Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedProject.compliance === 'current' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedProject.compliance === 'current' ? '✓ Current' : '⚠ Overdue'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-lg">
                    View Full Project Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-slate-500 print:hidden">
          <p>This dashboard complements the CNT Open Data portal. For raw project listings and compliance status, visit the portal.</p>
          <p className="mt-1">Data extracted from C&D waste survey checkbox responses. Map overlays available for Council Districts and ZIP codes.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
};

export default ConstructionWasteDashboard;