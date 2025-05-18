import { useEffect, useState } from "react";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const EditProfileModal = ({ authUser, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname,
        username: authUser.username,
        email: authUser.email,
        bio: authUser.bio,
        link: authUser.link,
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  if (!isOpen) return null;

  return (
    <dialog id="edit_profile_modal" className="modal modal-open">
      <div className="modal-box theme-card">
        <h3 className="font-bold text-lg my-3 theme-text-primary">Update Profile</h3>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile(formData);
            onClose();
          }}
        >
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Full Name"
              className="flex-1 input theme-text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded p-2 input-md"
              value={formData.fullname}
              name="fullname"
              onChange={handleInputChange}
            />
            <input
              type="text"
              placeholder="Username"
              className="flex-1 input theme-text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded p-2 input-md"
              value={formData.username}
              name="username"
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 input theme-text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded p-2 input-md"
              value={formData.email}
              name="email"
              onChange={handleInputChange}
            />
            <textarea
              placeholder="Bio"
              className="flex-1 input theme-text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded p-2 input-md"
              value={formData.bio}
              name="bio"
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="password"
              placeholder="Current Password"
              className="flex-1 input theme-text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded p-2 input-md"
              value={formData.currentPassword}
              name="currentPassword"
              onChange={handleInputChange}
            />
            <input
              type="password"
              placeholder="New Password"
              className="flex-1 input theme-text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded p-2 input-md"
              value={formData.newPassword}
              name="newPassword"
              onChange={handleInputChange}
            />
          </div>
          <input
            type="text"
            placeholder="Link"
            className="flex-1 input theme-text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded p-2 input-md"
            value={formData.link}
            name="link"
            onChange={handleInputChange}
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              className="theme-button-secondary rounded-full px-4 py-1 hover:bg-red-500/20 hover:text-red-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="theme-button-primary rounded-full px-4 py-1">
              {isUpdatingProfile ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/50" onClick={onClose}>
        <button className="outline-none cursor-default w-full h-full">close</button>
      </form>
    </dialog>
  );
};

export default EditProfileModal;
