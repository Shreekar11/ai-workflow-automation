import { createClient } from "@/utils/supabase/client";
import { createServiceClient } from "@/utils/supabase/client";

interface UserMetadata {
  name?: string;
  email?: string;
}

/**
 * Service for handling user-related operations
 */
export class UserService {
  /**
   * Save a new user to Supabase after authentication
   * @param setError Function to set error messages
   * @returns Object containing user data or success message
   */
  public async saveUserToSupabase() {
    try {
      const supabase = createClient();
      const session = await supabase.auth.getUser();

      const {
        data: { user },
      } = session;

      if (!user) {
        throw new Error("No user found");
      }

      const { name, email } = user.user_metadata as UserMetadata;

      if (!email) {
        throw new Error("Email is required");
      }

      const { data: existingUser } = await supabase
        .from("users")
        .select()
        .eq("auth_id", user.id)
        .single();

      if (existingUser) {
        return {
          status: true,
          message: "User already exists",
          userData: existingUser,
          isNewUser: false,
        };
      }

      const { error: supabaseError, data } = await supabase
        .from("users")
        .insert({
          first_name: name?.split(" ")[0] || "",
          last_name: name?.split(" ")[1] || "",
          email: email,
          auth_id: user.id,
        })
        .select();

      if (supabaseError) {
        if (supabaseError.code === "23505") {
          throw new Error(
            "This email is already registered. Please use a different email."
          );
        }
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      return {
        status: true,
        message: "User successfully registered",
        userData: data?.[0] || null,
        isNewUser: true,
      };
    } catch (error: any) {
      console.error("Error in saveUserToSupabase:", error);
      return {
        status: false,
        message: `Failed to save user data: ${error.message}`,
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Get the current authenticated user
   * @returns The authenticated user or null
   */
  public async getCurrentUser() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }

      return {
        status: true,
        message: "User session retrieved successfully!",
        data: data.user,
      };
    } catch (err: any) {
      console.error("User session unexpected error:", err);
      return {
        status: false,
        message: `User session error: ${err.message || "Unknown error"}`,
        error: "USER_SESSION_ERROR",
      };
    }
  }

  /**
   * Get a user by their auth ID using the service client (bypasses RLS)
   * @param authUserId The auth ID of the user to retrieve
   * @returns User data with status and message
   */
  public async getAuthUserWithServiceRole(authUserId: string) {
    try {
      // Use service client to bypass RLS
      const supabase = createServiceClient();

      // Get the user record from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUserId)
        .single();

      if (userError) {
        console.error("Service client error:", userError);
        return {
          status: false,
          message: `Service client error: ${userError.message}`,
          error: "SERVICE_CLIENT_ERROR",
        };
      }

      if (!userData) {
        return {
          status: false,
          message: "User account not found with service client",
          error: "USER_NOT_FOUND",
        };
      }

      return {
        status: true,
        message: "User found with service client",
        data: userData,
      };
    } catch (error: any) {
      console.error("Service client unexpected error:", error);
      return {
        status: false,
        message: `Service client error: ${error.message || "Unknown error"}`,
        error: "SERVICE_CLIENT_ERROR",
      };
    }
  }
}
