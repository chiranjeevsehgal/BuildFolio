const axios = require("axios");

class LinkedInService {
  constructor() {
    this.baseURL = "https://api.linkedin.com/v2";
  }

  async getProfile(accessToken) {
    try {
      // Get basic profile
      const profileResponse = await axios.get(`${this.baseURL}/people/~`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        params: {
          projection:
            "(id,firstName,lastName,headline,summary,location,profilePicture(displayImage~:playableStreams))",
        },
      });

      const profile = profileResponse.data;

      // Get positions (experience)
      const positionsResponse = await axios.get(`${this.baseURL}/positions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        params: {
          projection:
            "(elements*(id,title,company,location,startDate,endDate,current,summary))",
        },
      });

      // Get education
      const educationResponse = await axios.get(`${this.baseURL}/educations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        params: {
          projection:
            "(elements*(id,schoolName,degree,fieldOfStudy,startDate,endDate,activities,notes))",
        },
      });

      // Get skills
      const skillsResponse = await axios.get(`${this.baseURL}/skills`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        params: {
          projection: "(elements*(id,name))",
        },
      });

      // Process and return structured data
      return {
        id: profile.id,
        firstName: profile.firstName?.localized?.en_US,
        lastName: profile.lastName?.localized?.en_US,
        headline: profile.headline?.localized?.en_US,
        summary: profile.summary?.localized?.en_US,
        location: profile.location?.name,
        profilePicture: this.extractProfilePicture(profile.profilePicture),
        publicProfileUrl: `https://linkedin.com/in/${profile.id}`,
        experience: this.processExperience(
          positionsResponse.data?.elements || [],
        ),
        education: this.processEducation(
          educationResponse.data?.elements || [],
        ),
        skills: this.processSkills(skillsResponse.data?.elements || []),
      };
    } catch (error) {
      console.error(
        "LinkedIn API error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to fetch LinkedIn profile data");
    }
  }

  extractProfilePicture(profilePicture) {
    try {
      const elements = profilePicture?.displayImage?.elements;
      if (elements && elements.length > 0) {
        // Get the largest image
        const largestImage = elements.reduce((prev, current) =>
          (prev.data?.width || 0) > (current.data?.width || 0) ? prev : current,
        );
        return largestImage.identifiers?.[0]?.identifier;
      }
    } catch (error) {
      console.error("Error extracting profile picture:", error);
    }
    return null;
  }

  processExperience(positions) {
    return positions.map((position) => ({
      title: position.title,
      company: position.company?.name,
      location: position.location?.name,
      startDate: this.formatLinkedInDate(position.startDate),
      endDate: position.endDate
        ? this.formatLinkedInDate(position.endDate)
        : null,
      current: position.current || false,
      description: position.summary,
    }));
  }

  processEducation(educations) {
    return educations.map((education) => ({
      degree: education.degree,
      school: education.schoolName,
      fieldOfStudy: education.fieldOfStudy,
      startDate: this.formatLinkedInDate(education.startDate),
      endDate: education.endDate
        ? this.formatLinkedInDate(education.endDate)
        : null,
      description: education.activities || education.notes,
    }));
  }

  processSkills(skills) {
    return skills.map((skill) => skill.name).filter(Boolean);
  }

  formatLinkedInDate(dateObj) {
    if (!dateObj) return null;
    try {
      const year = dateObj.year;
      const month = dateObj.month || 1;
      return new Date(year, month - 1, 1);
    } catch (error) {
      console.error("Date formatting error:", error);
      return null;
    }
  }
}

module.exports = new LinkedInService();
