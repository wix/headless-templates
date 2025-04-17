export interface FormData {
  // Team Information
  teamName: string;
  ageGroup: string;
  skillLevel: string;

  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Additional Information
  specialRequirements?: string;
  agreeTerms: boolean;
}

/**
 * Submits a tournament registration form to the backend.
 * In a real application, this would make an API call to a server.
 *
 * @param formData The form data to submit
 * @returns A promise that resolves to the submission result
 */
export async function submitTournamentRegistration(
  formData: FormData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // This simulates a network request to an API
    console.log("Submitting form data:", formData);

    // Validate required fields
    const requiredFields: (keyof FormData)[] = [
      "teamName",
      // "ageGroup",
      // "skillLevel",
      // "firstName",
      // "lastName",
      // "email",
      // "phone",
      // "agreeTerms",
    ];

    for (const field of requiredFields) {
      if (field === "agreeTerms") {
        if (!formData[field]) {
          throw new Error(`You must agree to the terms and conditions.`);
        }
      } else if (!formData[field]) {
        throw new Error(`Field ${field} is required.`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error("Please enter a valid email address.");
    }

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate a random ID for the registration
    const registrationId = Math.random().toString(36).substring(2, 15);

    return {
      success: true,
      id: registrationId,
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Retrieves data for a tournament registration by ID.
 * In a real application, this would query a database or API.
 *
 * @param id The registration ID
 * @returns A promise that resolves to the registration data
 */
export async function getTournamentRegistration(
  id: string
): Promise<{ success: boolean; data?: FormData; error?: string }> {
  try {
    // This would typically be a fetch request to an API
    console.log("Fetching registration with ID:", id);

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For demonstration purposes, return dummy data
    // In a real application, this would be data from a database
    if (id) {
      return {
        success: true,
        data: {
          teamName: "Demo Team",
          ageGroup: "under16",
          skillLevel: "intermediate",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          specialRequirements: "None",
          agreeTerms: true,
        },
      };
    } else {
      throw new Error("Registration not found");
    }
  } catch (error) {
    console.error("Error retrieving registration:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
