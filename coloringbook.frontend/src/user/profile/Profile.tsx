import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { updateUserProfile, requestEmailVerification } from '@util/APIUtils'; // New API call
import LoadingIndicator from '@common/LoadingIndicator'; // Assuming you have a LoadingIndicator component

interface User {
  id: number; // Assuming user has an ID
  name?: string;
  email?: string;
  imageUrl?: string;
  emailVerified?: boolean; // Added emailVerified field
}

interface ProfileProps {
  currentUser: User;
  onUserUpdate: (updatedUser: User) => void; // Prop to update user in App.tsx
}

const MAX_RETRIES = 3; // Maximum number of times to retry loading the image

const Profile: React.FC<ProfileProps> = ({ currentUser, onUserUpdate }) => {
  const { t, i18n } = useTranslation('common'); // Get i18n instance
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name || '');
  const [editedEmail, setEditedEmail] = useState(currentUser.email || '');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(currentUser.imageUrl);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false); // New state for verification loading
  const [showGithubEmailWarning, setShowGithubEmailWarning] = useState(false);

  // Effect to initialize form fields and check for GitHub email when currentUser changes
  useEffect(() => {
    setEditedName(currentUser.name || '');
    setEditedEmail(currentUser.email || '');
    setCurrentImageUrl(currentUser.imageUrl);
    setRetryCount(0); // Reset retry count for a new image URL

    // Check for GitHub noreply email
    const isGithubNoreply = currentUser.email?.endsWith('@users.noreply.github.com');
    if (isGithubNoreply) {
      setIsEditing(true); // Automatically enter edit mode
      setShowGithubEmailWarning(true); // Show warning
      toast.warn(t('github_email_warning'), { autoClose: false, toastId: 'github-email-warning' });
    } else {
      setIsEditing(false); // Ensure not in edit mode if email is fine
      setShowGithubEmailWarning(false);
      toast.dismiss('github-email-warning'); // Dismiss warning if email is no longer noreply
    }
  }, [currentUser, t]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`Failed to load profile image: ${e.currentTarget.src}. Attempt ${retryCount + 1} of ${MAX_RETRIES}.`);

    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      // By changing the key, React will re-mount the <img> element,
      // forcing a new load attempt with the same URL.
    } else {
      console.error('Max retries reached. Falling back to text avatar.');
      setCurrentImageUrl(undefined); // Fallback to text avatar if all retries fail
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedName(currentUser.name || '');
    setEditedEmail(currentUser.email || '');
    setIsEditing(false);
    setShowGithubEmailWarning(false); // Hide warning on cancel
    toast.dismiss('github-email-warning');
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const updatedUser = await updateUserProfile({
        name: editedName,
        email: editedEmail,
      });
      onUserUpdate(updatedUser); // Update parent state
      setIsEditing(false);
      setShowGithubEmailWarning(false); // Hide warning on successful save
      toast.dismiss('github-email-warning');
      toast.success(t('user.update.success'), { autoClose: 3000 });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || t('user.update.error'), { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    setIsRequestingVerification(true);
    try {
      const response = await requestEmailVerification(i18n.language); // Pass current language
      toast.success(response.message || t('email.verification.sent'), { autoClose: 5000 });
    } catch (error: any) {
      console.error('Failed to request email verification:', error);
      toast.error(error.message || t('email.verification.error'), { autoClose: 5000 });
    } finally {
      setIsRequestingVerification(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '30px' }}>
      <div className="row">
        <div className="col-md-6 col-md-offset-3 text-center">
          <div className="panel panel-default" style={{ padding: '30px' }}>
            <div className="profile-avatar" style={{ marginBottom: '20px' }}>
              {currentImageUrl ? (
                <img 
                  key={`${currentImageUrl}-${retryCount}`}
                  src={currentImageUrl} 
                  alt={editedName || t('user_alt_text')} 
                  onError={handleImageError}
                  className="img-circle img-responsive center-block"
                  style={{ maxWidth: '200px', height: '200px' }}
                />
              ) : (
                <div className="text-avatar center-block" style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'linear-gradient(45deg, #46b5e5 1%, #1e88e5 64%, #40baf5 97%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <span style={{ lineHeight: '200px', color: '#fff', fontSize: '3em' }}>{editedName ? editedName.charAt(0).toUpperCase() : '?'}</span>
                </div>
              )}
            </div>
            <div className="profile-details">
              {showGithubEmailWarning && (
                <div className="alert alert-warning" role="alert" style={{ marginBottom: '20px' }}>
                  {t('github_email_warning')}
                </div>
              )}
              {isEditing ? (
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label htmlFor="nameInput" className="sr-only">{t('name_placeholder')}</label>
                    <input
                      type="text"
                      id="nameInput"
                      className="form-control"
                      placeholder={t('name_placeholder')}
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      required
                      disabled={isLoading}
                      style={{ marginBottom: '10px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="emailInput" className="sr-only">{t('email_placeholder')}</label>
                    <input
                      type="email"
                      id="emailInput"
                      className="form-control"
                      placeholder={t('email_placeholder')}
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      style={{ marginBottom: '20px' }}
                    />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginRight: '10px' }}>
                      {isLoading ? <LoadingIndicator /> : t('save')}
                    </button>
                    <button type="button" className="btn btn-default" onClick={handleCancel} disabled={isLoading}>
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-name">
                    <h2>{currentUser.name || t('unnamed_user')}</h2>
                    <p className="text-muted">
                      {currentUser.email || t('no_email_available')}
                      {currentUser.email && (
                        <span style={{ marginLeft: '10px', fontWeight: 'bold', color: currentUser.emailVerified ? '#52c41a' : '#f5222d' }}>
                          ({currentUser.emailVerified ? t('email.verified') : t('email.unverified')})
                        </span>
                      )}
                    </p>
                  </div>
                  {!currentUser.emailVerified && currentUser.email && (
                    <button 
                      type="button" 
                      className="btn btn-success" 
                      onClick={handleRequestVerification} 
                      disabled={isRequestingVerification}
                      style={{ marginTop: '10px', marginBottom: '10px' }}
                    >
                      {isRequestingVerification ? <LoadingIndicator /> : t('email.verify_button')}
                    </button>
                  )}
                  <button type="button" className="btn btn-primary" onClick={handleEdit} style={{ marginTop: '20px' }}>
                    {t('edit_profile')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;