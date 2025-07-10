// templates/TemplateRegistry.js - Central registry for template ID to component mapping
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import DeveloperTemplate from "./DeveloperTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";
import CreativeGradientTemplate from "./CreativeGradientTemplate";

/**
 * Template Registry - Maps template IDs from database to React components
 *
 * Structure:
 * templateId (from database) -> React Component
 *
 * When adding new templates:
 * 1. Create the template JSX file in /templates/ folder
 * 2. Import it at the top of this file
 * 3. Add mapping entry below with the exact templateId from database
 * 4. Add the template data to your database with the same templateId
 */
const TEMPLATE_REGISTRY = {
  // Modern Professional Template
  "modern-professional": {
    component: ModernTemplate,
    name: "Modern Professional",
    category: "modern",
    description:
      "A cutting-edge portfolio template featuring animated gradient backgrounds, glassmorphism effects, and dynamic content cards. Built with modern design principles including floating animations, skill proficiency bars, and immersive visual experiences that captivate and engage visitors.",
  },

  // Minimal Clean Template
  "minimal-clean": {
    component: MinimalTemplate,
    name: "Minimal Clean",
    category: "minimal",
    description:
      "A pristine, minimalist portfolio template featuring clean typography, subtle borders, and elegant spacing. Perfect for professionals who prefer understated sophistication and want their work to speak for itself without visual distractions.",
  },

  // Creative Portfolio Template
  "creative-gradient": {
    component: CreativeGradientTemplate,
    name: "Creative Gradient",
    category: "creative",
    description:
      "A vibrant, creative React portfolio template featuring gradient backgrounds, animated elements, glassmorphism effects, and dynamic project showcases. Perfect for creative professionals, designers, and developers who want to make a bold visual impact.",
  },

  // Developer Focused Template
  "terminal-developer-focused": {
    component: DeveloperTemplate,
    name: "Terminal Developer Focused",
    category: "developer",
    description:
      "A unique developer portfolio template designed as a terminal interface with command-line aesthetics, animated cursor, and code-style formatting. Perfect for developers who want to showcase their technical skills in an authentic coding environment.",
  },

  // Executive Suite Template
  "executive-suite": {
    component: ExecutiveTemplate,
    name: "Executive Professional Suite",
    category: "executive",
    description:
      "A sophisticated, corporate-grade portfolio template designed for C-level executives, senior managers, and business leaders. Features professional overview statistics, timeline-based experience showcase, and clean corporate aesthetics that convey authority and expertise.",
  },
};

/**
 * Get template component and metadata by template ID
 * @param {string} templateId - The template ID from database
 * @returns {Object|null} Template object with component and metadata, or null if not found
 */
export const getTemplateComponent = (templateId) => {
  if (!templateId) {
    console.error("Template ID is required");
    return null;
  }

  const template = TEMPLATE_REGISTRY[templateId];

  if (!template) {
    console.error(`Template not found for ID: ${templateId}`);
    return null;
  }

  return template;
};

/**
 * Get all available templates
 * @returns {Array} Array of template objects with IDs
 */
export const getAllTemplates = () => {
  return Object.keys(TEMPLATE_REGISTRY).map((id) => ({
    id,
    ...TEMPLATE_REGISTRY[id],
  }));
};

/**
 * Check if a template ID exists in the registry
 * @param {string} templateId - The template ID to check
 * @returns {boolean} True if template exists, false otherwise
 */
export const isValidTemplateId = (templateId) => {
  return templateId && TEMPLATE_REGISTRY.hasOwnProperty(templateId);
};

/**
 * Get templates by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of templates in the specified category
 */
export const getTemplatesByCategory = (category) => {
  return Object.entries(TEMPLATE_REGISTRY)
    .filter(([_, template]) => template.category === category)
    .map(([id, template]) => ({ id, ...template }));
};

/**
 * Template loading with error handling
 * @param {string} templateId - The template ID to load
 * @returns {Promise<Object>} Promise that resolves to template object or throws error
 */
export const loadTemplate = async (templateId) => {
  return new Promise((resolve, reject) => {
    try {
      const template = getTemplateComponent(templateId);

      if (!template) {
        reject(new Error(`Template "${templateId}" not found in registry`));
        return;
      }

      // Simulate async loading (useful for future dynamic imports)
      setTimeout(() => {
        resolve(template);
      }, 100);
    } catch (error) {
      reject(new Error(`Failed to load template: ${error.message}`));
    }
  });
};

// Export the registry for debugging purposes (only in development)
export const getRegistry = () => {
  if (process.env.NODE_ENV === "development") {
    return TEMPLATE_REGISTRY;
  }
  return null;
};

export default TEMPLATE_REGISTRY;
