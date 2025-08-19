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
        <div className={styles.editcontainer}>
          <p className={styles.edittitle}>Bio</p>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
          />
        </div>

        <div className={styles.editcontainer}>
          <p className={styles.edittitle}>Github</p>
          <input
            name="github"
            value={formData.github}
            onChange={handleChange}
            placeholder="GitHub URL"
          />
        </div>

        <div className={styles.editcontainer}>
          <p className={styles.edittitle}>LinkedIn</p>
            <input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn URL"
            />
        </div>

        <div className={styles.editcontainer}>
          <p className={styles.edittitle}>X (formerly twitter)</p>
            <input
              name="x"
              value={formData.x}
              onChange={handleChange}
              placeholder="X URL"
            />
        </div>

        <div className={styles.editcontainer}>
          <p className={styles.edittitle}>Personal Website / Portofolio</p>
            <input
              name="personalWebsite"
              value={formData.personalWebsite}
              onChange={handleChange}
              placeholder="Personal Website URL"
            />
        </div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </>

  );
}

export default EditProfile