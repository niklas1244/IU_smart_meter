import React, { useEffect, useState } from "react";

interface UserInfo {
  address: string;
  city: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  userID: number;
  zip_code: string;
}

const UserCard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [editableUserInfo, setEditableUserInfo] = useState<UserInfo | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditableUserInfo((prev) => (prev ? { ...prev, [name]: value } : null));
    const error = validateField(name, value); // Validate the field as the user types
    setValidationErrors((prev) => ({ ...prev, [name]: error ?? "" }));
    setModifiedFields((prev) => new Set([...prev, name])); // Mark field as modified
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "first_name":
      case "last_name":
        if (!value.trim()) {
          return "This field is required.";
        } else if (!/^[A-Za-zßöäü\s]+$/.test(value)) {
          return "Only alphabetic characters are allowed.";
        }
        break;
      case "phone":
        if (!value.trim()) {
          return "This field is required.";
        } else if (
          !/^[\d-.]+$/.test(value)
        ) {
          return "Phone number must be valid. Examples: 1234567890, 123-456-7890, (123) 456-7890.";
        }
        break;
      case "email":
        if (!value.trim()) {
          return "This field is required.";
        } else if (
          !/^[A-Za-zß0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/.test(value)
        ) {
          return "Invalid email format.";
        }
        break;
      case "address":
        if (!value.trim()) {
          return "Address is required.";
        } else if (!/^[A-Za-z0-9ßöäü\s,.'-]+$/.test(value)) {
          return "Address only allows numbers, letters and .-,";
        }
        break;
      case "city":
        if (!value.trim()) {
          return "City is required.";
        } else if (!/^[A-Za-zöäüß\s]+$/.test(value)) {
          return "City can only contain letters and spaces.";
        } else if (value.length < 2) {
          return "City name must be at least 2 characters long.";
        }
        break;
      case "zip_code":
        if (!value.trim()) {
          return "This field is required.";
        } else if (!/^\d{5}(?:-\d{4})?$/.test(value)) {
          return "Invalid zip code format.";
        }
        break;
      default:
        break;
    }
    return "";
  };

  const validateModifiedFields = (): boolean => {
    let isValid = true;

    const updatedErrors: { [key: string]: string } = {};
    modifiedFields.forEach((field) => {
      const value = editableUserInfo?.[field as keyof UserInfo] || "";
      const error = validateField(field, value.toString());
      if (error) {
        isValid = false;
        updatedErrors[field] = error;
      }
    });

    setValidationErrors((prev) => ({ ...prev, ...updatedErrors }));
    return isValid;
  };

  const saveUserInfo = async () => {
    if (!validateModifiedFields()) {
      alert("Please correct the highlighted errors before saving.");
      return;
    }

    try {
      const authToken = localStorage.getItem("token");
      if (authToken) {
        const response = await fetch("/api/user/update_user", {
          method: "POST",
          headers: {
            Authorization: `${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editableUserInfo),
        });

        if (!response.ok) {
          throw new Error("Failed to update user info");
        }
        alert('User updated successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem("token");
        if (authToken) {
          const [userInfoResponse] = await Promise.all([
            fetch("/api/user/get_user", {
              method: "GET",
              headers: {
                Authorization: `${authToken}`,
                "Content-Type": "application/json",
              },
            }),
          ]);

          if (!userInfoResponse.ok) {
            throw new Error("Network response was not ok");
          }

          const userInfoData = await userInfoResponse.json();
          setEditableUserInfo(userInfoData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="personalDetailsCard">
      <form className="userInfo">
        {[
          { label: "First Name", name: "first_name", type: "text" },
          { label: "Last Name", name: "last_name", type: "text" },
          { label: "Phone Number", name: "phone", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Address", name: "address", type: "text" },
          { label: "City", name: "city", type: "text" },
          { label: "Zip Code", name: "zip_code", type: "text" },
        ].map((field) => (
          <div className="infoRow" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={editableUserInfo?.[field.name as keyof UserInfo] || ""}
              onChange={handleInputChange}
            />
            {validationErrors[field.name] && (
              <span className="errorMessage">
                {validationErrors[field.name]}
              </span>
            )}
          </div>
        ))}
        <button className="saveButton" type="button" onClick={saveUserInfo}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UserCard;
