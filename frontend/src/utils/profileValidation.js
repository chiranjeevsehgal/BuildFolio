export class ValidationError extends Error {
  constructor(field, message) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export const VALIDATION_RULES = {
  personal: {
    phone: {
      required: false,
      pattern: /^\d{10}$/,
      message: "Enter a valid 10-digit phone number"
    },
    location: {
      required: false,
      minLength: 2,
      maxLength: 100,
      message: "Location must be between 2-100 characters"
    },
    linkedin: {
      required: false,
      pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      message: "Enter a valid LinkedIn profile URL"
    },
    github: {
      required: false,
      pattern: /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/,
      message: "Enter a valid GitHub profile URL"
    }
  },
  professional: {
    title: {
      required: false,
      minLength: 2,
      maxLength: 100,
      message: "Professional title must be between 2-100 characters"
    },
    summary: {
      required: false,
      minLength: 50,
      maxLength: 1000,
      message: "Summary must be between 50-1000 characters"
    },
    skills: {
      required: false,
      minCount: 3,
      maxCount: 20,
      message: "Add at least 3 skills (maximum 20)"
    }
  },
  experience: {
    title: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: "Job title is required (2-100 characters)"
    },
    company: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: "Company name is required (2-100 characters)"
    },
    startDate: {
      required: true,
      message: "Start date is required"
    },
    endDate: {
      conditionalRequired: (item) => !item.current,
      message: "End date is required for past positions"
    },
    description: {
      required: false,
      minLength: 20,
      maxLength: 1000,
      message: "Description should be at least 20 characters if provided"
    }
  },
  education: {
    degree: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: "Degree/certification is required (2-100 characters)"
    },
    school: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: "Institution name is required (2-100 characters)"
    },
    startDate: {
      required: true,
      message: "Start date is required"
    },
    endDate: {
      required: true,
      message: "End date is required"
    }
  },
  projects: {
    title: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: "Project title is required (2-100 characters)"
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 1000,
      message: "Project description must be between 20 and 1000 characters"
    },
    skills: {
      required: false,
      minCount: 0,
      maxCount: 10,
      message: "At least one skill is required (maximum 10)"
    }
  }
}

// Validate individual field
export const validateField = (value, rules, item = null) => {
  const errors = []

  // Check if field has data or is being validated
  const hasValue = value !== null && value !== undefined && value !== ''
  const isArray = Array.isArray(value)
  const hasArrayValue = isArray && value.length > 0

  // Required field validation
  if (rules.required && (!hasValue && !hasArrayValue)) {
    errors.push(rules.message || "This field is required")
    return errors
  }

  // Conditional required validation
  if (rules.conditionalRequired && typeof rules.conditionalRequired === 'function') {
    if (rules.conditionalRequired(item) && (!hasValue && !hasArrayValue)) {
      errors.push(rules.message || "This field is required")
      return errors
    }
  }

  // Only validate format if field has value
  if (hasValue || hasArrayValue) {
    // Pattern validation
    if (rules.pattern && hasValue && !rules.pattern.test(value)) {
      errors.push(rules.message || "Invalid format")
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(rules.message || `Minimum ${rules.minLength} characters required`)
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(rules.message || `Maximum ${rules.maxLength} characters allowed`)
      }
    }

    // Count validation for arrays
    if (isArray) {
      if (rules.minCount && value.length < rules.minCount) {
        errors.push(rules.message || `At least ${rules.minCount} items required`)
      }
      if (rules.maxCount && value.length > rules.maxCount) {
        errors.push(rules.message || `Maximum ${rules.maxCount} items allowed`)
      }
    }
  }

  return errors
}

export const validatePersonalInfo = (personalInfo) => {
  const errors = {}
  const rules = VALIDATION_RULES.personal

  // Only validate if section has any data
  const hasPersonalData = !!(
    personalInfo.phone ||
    personalInfo.location ||
    personalInfo.socialLinks?.linkedin ||
    personalInfo.socialLinks?.github
  )

  if (!hasPersonalData) return { errors: {}, isValid: true, hasData: false }

  // Validate individual fields only if they have data
  if (personalInfo.phone) {
    const phoneErrors = validateField(personalInfo.phone, rules.phone)
    if (phoneErrors.length > 0) errors.phone = phoneErrors
  }

  if (personalInfo.location) {
    const locationErrors = validateField(personalInfo.location, rules.location)
    if (locationErrors.length > 0) errors.location = locationErrors
  }

  if (personalInfo.socialLinks?.linkedin) {
    const linkedinErrors = validateField(personalInfo.socialLinks.linkedin, rules.linkedin)
    if (linkedinErrors.length > 0) errors.linkedin = linkedinErrors
  }

  if (personalInfo.socialLinks?.github) {
    const githubErrors = validateField(personalInfo.socialLinks.github, rules.github)
    if (githubErrors.length > 0) errors.github = githubErrors
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    hasData: hasPersonalData
  }
}

export const validateProfessionalInfo = (professionalInfo) => {
  const errors = {}
  const rules = VALIDATION_RULES.professional

  // Only validate if section has any data
  const hasProfessionalData = !!(
    professionalInfo.title ||
    professionalInfo.summary ||
    (professionalInfo.skills && professionalInfo.skills.length > 0)
  )

  if (!hasProfessionalData) return { errors: {}, isValid: true, hasData: false }

  // Validate individual fields only if they have data
  if (professionalInfo.title) {
    const titleErrors = validateField(professionalInfo.title, rules.title)
    if (titleErrors.length > 0) errors.title = titleErrors
  }

  if (professionalInfo.summary) {
    const summaryErrors = validateField(professionalInfo.summary, rules.summary)
    if (summaryErrors.length > 0) errors.summary = summaryErrors
  }

  if (professionalInfo.skills && professionalInfo.skills.length > 0) {
    const skillsErrors = validateField(professionalInfo.skills, rules.skills)
    if (skillsErrors.length > 0) errors.skills = skillsErrors
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    hasData: hasProfessionalData
  }
}

export const validateExperience = (experience) => {
  const errors = {}
  const rules = VALIDATION_RULES.experience

  if (!experience || experience.length === 0) {
    return { errors: {}, isValid: true, hasData: false }
  }

  experience.forEach((exp, index) => {
    // Check if experience entry has any data
    const hasExpData = !!(
      exp.title || exp.company || exp.description ||
      exp.startDate || exp.endDate || exp.location
    )

    if (hasExpData) {
      // Validate required fields
      Object.keys(rules).forEach(field => {
        const rule = rules[field]
        const value = exp[field]
        const fieldErrors = validateField(value, rule, exp)

        if (fieldErrors.length > 0) {
          errors[`experience_${index}_${field}`] = fieldErrors
        }
      })
    }
  })

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    hasData: experience.length > 0
  }
}

export const validateEducation = (education) => {
  const errors = {}
  const rules = VALIDATION_RULES.education

  if (!education || education.length === 0) {
    return { errors: {}, isValid: true, hasData: false }
  }

  education.forEach((edu, index) => {
    // Check if education entry has any data
    const hasEduData = !!(
      edu.degree || edu.school || edu.location ||
      edu.startDate || edu.endDate || edu.description
    )

    if (hasEduData) {
      // Validate required fields
      Object.keys(rules).forEach(field => {
        const rule = rules[field]
        const value = edu[field]
        const fieldErrors = validateField(value, rule, edu)

        if (fieldErrors.length > 0) {
          errors[`education_${index}_${field}`] = fieldErrors
        }
      })
    }
  })

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    hasData: education.length > 0
  }
}

export const validateProjects = (projects) => {
  const errors = {}
  const rules = VALIDATION_RULES.projects

  if (!projects || projects.length === 0) {
    return { errors: {}, isValid: true, hasData: false }
  }

  projects.forEach((project, index) => {
    // Check if project entry has any data
    const hasProjectData = !!(
      project.title || project.description || project.url ||
      project.githubUrl || (project.skills && project.skills.length > 0)
    )

    if (hasProjectData) {
      // Validate required fields
      Object.keys(rules).forEach(field => {
        const rule = rules[field]
        const value = project[field]
        const fieldErrors = validateField(value, rule, project)

        if (fieldErrors.length > 0) {
          errors[`project_${index}_${field}`] = fieldErrors
        }
      })
    }
  })

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    hasData: projects.length > 0
  }
}

export const validateCompleteProfile = (profileData) => {
  const personalValidation = validatePersonalInfo(profileData.personalInfo)
  const professionalValidation = validateProfessionalInfo(profileData.professional)
  const experienceValidation = validateExperience(profileData.experience)
  const educationValidation = validateEducation(profileData.education)
  const projectsValidation = validateProjects(profileData.projects)

  const allErrors = {
    ...personalValidation.errors,
    ...professionalValidation.errors,
    ...experienceValidation.errors,
    ...educationValidation.errors,
    ...projectsValidation.errors
  }

  return {
    errors: allErrors,
    isValid: Object.keys(allErrors).length === 0,
    sectionValidation: {
      personal: personalValidation,
      professional: professionalValidation,
      experience: experienceValidation,
      education: educationValidation,
      projects: projectsValidation
    }
  }
}

// Calculate completion percentage (matching backend logic)
export const calculateCompletionPercentage = (profileData) => {
  let completed = 0
  const total = 5

  // Personal info (phone, location, or social links)
  if (profileData.personalInfo.phone ||
    profileData.personalInfo.location ||
    profileData.personalInfo.socialLinks?.linkedin ||
    profileData.personalInfo.socialLinks?.github) {
    completed++
  }

  // Professional info (title, summary, or skills)
  if (profileData.professional.title ||
    profileData.professional.summary ||
    (profileData.professional.skills && profileData.professional.skills.length > 0)) {
    completed++
  }

  // Experience
  if (profileData.experience && profileData.experience.length > 0) {
    completed++
  }

  // Projects
  if (profileData.projects && profileData.projects.length > 0) {
    completed++
  }

  // Education
  if (profileData.education && profileData.education.length > 0) {
    completed++
  }

  return Math.round((completed / total) * 100)
}

export const checkSectionValidity = (sectionValidation) => {
  return {
    personal: sectionValidation.personal.hasData ? sectionValidation.personal.isValid : true,
    professional: sectionValidation.professional.hasData ? sectionValidation.professional.isValid : true,
    experience: sectionValidation.experience.hasData ? sectionValidation.experience.isValid : true,
    education: sectionValidation.education.hasData ? sectionValidation.education.isValid : true,
    projects: sectionValidation.projects.hasData ? sectionValidation.projects.isValid : true
  }
}