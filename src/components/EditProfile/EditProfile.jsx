import { useState } from "react";
import styles from './EditProfile.module.css';


function EditProfile({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    bio: profile.bio || "",
    github: profile.github || "",
    linkedin: profile.linkedin || "",
    x: profile.x || "",
    personalWebsite: profile.personalWebsite || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // limit bio length
    if (name === "bio" && value.length > maxLength) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

//   to do add a filter function so that the length is always 200
  const maxLength = 200;

  return (
    <>
      <div className={styles.editPopup}>
        <div>
          <p className={styles.edittitle}>Bio</p>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
          />
        </div>

        <input
          name="github"
          value={formData.github}
          onChange={handleChange}
          placeholder="GitHub URL"
        />
        <input
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="LinkedIn URL"
        />
        <input
          name="x"
          value={formData.x}
          onChange={handleChange}
          placeholder="X URL"
        />
        <input
          name="personalWebsite"
          value={formData.personalWebsite}
          onChange={handleChange}
          placeholder="Personal Website URL"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </>

  );
}

export default EditProfile