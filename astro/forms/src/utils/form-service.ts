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
}

/**
 * Submits a tournament registration form to the backend.
 * In a real application, this would make an API call to a server.
 *
 * @param formData The form data to submit
 * @returns A promise that resolves to the submission result
 */
export async function submitTournamentRegistration(
  formData: Record<string, any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Validate required fields
    const requiredFields = ["teamName", "email"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Please fill in all required fields: ${missingFields.join(", ")}`,
      };
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    // Simulate network latency (shorter delay)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a registration ID
    const registrationId = Math.random().toString(36).substring(2, 10);

    console.log({ formData });

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
