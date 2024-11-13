import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { doc, updateDoc } from 'firebase/firestore';
import { updateDoc, serverTimestamp, onSnapshot, doc, addDoc, getDoc, getDocs, setDoc, collection, query, where, orderBy, limit, QuerySnapshot, Timestamp} from 'firebase/firestore';

import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import './styles.css';
import ProfilePictureSetup from './ProfilePictureSetup';

const WelcomeMessage = ({ nextStep }) => {
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState(''); // State to hold the first name
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle errors

  useEffect(() => {
    // Listen for auth state changes to get the user ID
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set the userId
        setUserId(user.uid);
      } else {
        // User is signed out
        setError('No user is logged in.');
        setLoading(false);
      }
    });

    // Cleanup the listener on component unmount
    return unsubscribe;
  }, []);
useEffect(() => {
    // Only fetch data if userId is set
    if (userId) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          // Fetch user document from Firestore
          const docRef = doc(db, 'Users', userId); // Adjust the collection and document ID as needed
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // If document exists, set the first name
            setFirstName(docSnap.data().first_name);
          } else {
            setError('User data not found');
          }
        } catch (error) {
          setError('Failed to fetch user data');
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [userId]); // Run fetchUserData whenever userId changes

  // Render loading, error, or data
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div className="profile-maker-container">
      <h1>Welcome, {firstName}!</h1>
      <p>Let’s set up your account!</p>
      <button className="next-btn" onClick={nextStep}>Next</button>
    </div>
  );
};


const ProfileName = ({ name, setName, nextStep }) => (
  <div className="profile-maker-container">
    <h2>What’s your display name?</h2>
    <h3>(You can change this later in settings.)</h3>
    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
    <button className="next-btn" onClick={nextStep}>Next</button>
  </div>
);

const GenderSelector = ({ nextStep, currentStep, prevStep }) => (
  <div className="profile-maker-container">
    <h2>Select your gender:</h2>
    <div className="radio-buttons">
      <label>
        <input type="radio" name="gender" value="male" /> Male
      </label>
      <label>
        <input type="radio" name="gender" value="female" /> Female
      </label>
      <label>
        <input type="radio" name="gender" value="non-binary" /> Non-binary
      </label>
    </div>
    <div className="button-group">
      <button className="next-btn" onClick={nextStep}>Next</button>
      <button className="back-btn" onClick={prevStep} disabled={currentStep === 0}>Back</button>
    </div>
  </div>
);
//
const defaultAvatars = [
  '/images/avatar1.png',
  '/images/avatar2.png',
  '/images/avatar3.png',
  '/images/avatar4.png', 
];

<ProfilePictureSetup />
//
  
const BioSetup = ({ bio, setBio,  nextStep, currentStep, prevStep}) => {
  const handleBioChange = (event) => {
    const input = event.target.value;
    if (input.length <= 500) {
      setBio(input);
    }
  };

  return (
    <div className="profile-maker-container">
      <h2>Tell us a little about yourself!</h2>
      <textarea
        value={bio}
        onChange={handleBioChange}
        placeholder="Enter a short bio (up to 500 characters)"
        maxLength={500}
      />
      <p>{bio.length}/500 characters</p>
      <div className="button-group">
        <button className="next-btn" onClick={nextStep}>Next</button>
        <button className="back-btn" onClick={prevStep} disabled={currentStep === 0}>Back</button>
      </div>
    </div>
  );
};
//
const availableInterests = [
  'Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry',
  'Literature', 'History', 'Psychology', 'Economics', 'Philosophy',
  'Engineering', 'Political Science', 'Art', 'Music', 'Sociology'
];

const InterestSelector = ({ nextStep, prevStep, selectedInterests, setSelectedInterests }) => {
  const toggleInterest = (interest) => {
    setSelectedInterests((prevInterests) =>
      prevInterests.includes(interest)
        ? prevInterests.filter((item) => item !== interest)
        : [...prevInterests, interest]
    );
  };

  return (
    <div className="profile-maker-container">
      <h2>Select your interests</h2>
      <p>Choose from various academic disciplines to personalize your profile.</p>
      <div className="interests-container">
        {availableInterests.map((interest) => (
          <button
            key={interest}
            className={`interest-button ${selectedInterests.includes(interest) ? 'selected' : ''}`}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="selected-interests">
        <h4>Your Selected Interests:</h4>
        <ul>
          {selectedInterests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </div>
      <div className="button-group">
        <button className="next-btn" onClick={nextStep}>Next</button>
        <button className="back-btn" onClick={prevStep}>Back</button>
      </div>
    </div>
  );
};
// end of interest selector
// Availability
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeBlocks = ['Morning', 'Afternoon', 'Evening', 'Night'];

const ScheduleSelector = ({ nextStep, prevStep,availability, setAvailability }) => {
  // Initialize availability state
  // const [availability, setAvailability] = useState(
  //   daysOfWeek.reduce((acc, day) => {
  //     acc[day] = {}; 
  //     timeBlocks.forEach((time) => {
  //       acc[day][time] = false; // All time blocks are unselected by default
  //     });
  //     return acc;
  //   }, {})
  // );

  // Toggle availability for a specific day and time
  const toggleAvailability = (day, time) => {
    setAvailability((prevAvailability) => ({
      ...prevAvailability,
      [day]: {
        ...prevAvailability[day],
        [time]: !prevAvailability[day][time],
      },
    }));
  };

  // Render the weekly schedule grid
  return (
    <div className="schedule-container">
      <h2>Select Your Availability</h2>
      <div className="schedule-grid">
        {/* Render header row with days of the week */}
        <div className="grid-row header-row">
          <div className="grid-cell time-label" /> {/* Empty cell for alignment */}
          {daysOfWeek.map((day) => (
            <div key={day} className="grid-cell header-cell">
              {day}
            </div>
          ))}
        </div>

        {/* Render time blocks for each day */}
        {timeBlocks.map((time) => (
          <div key={time} className="grid-row">
            {/* Time label on the left */}
            <div className="grid-cell time-label">{time}</div>

            {/* Day cells with toggle functionality */}
            {daysOfWeek.map((day) => (
              <div
                key={`${day}-${time}`}
                className={`grid-cell time-block ${availability[day][time] ? 'selected' : ''}`}
                onClick={() => toggleAvailability(day, time)}
              >
                {availability[day][time] ? '✓' : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Display a summary of selected availability */}
      <div className="availability-summary">
        <h3>Your Schedule:</h3>
        {Object.entries(availability).map(([day, times]) => {
          const selectedTimes = Object.entries(times)
            .filter(([_, isSelected]) => isSelected)
            .map(([time]) => time);

          return selectedTimes.length > 0 ? (
            <p key={day}>
              {day}: {selectedTimes.join(', ')}
            </p>
          ) : null;
        })}
      </div>
      <div className="button-group">
        <button className="next-btn" onClick={nextStep}>Next</button>
        <button className="back-btn" onClick={prevStep}>Back</button>
     </div>
    </div>
  );
};
// Profile Summary page
const ProfileSummary = ({prevStep, name, gender, profilePicture, highlightColor, bio, selectedInterests, schedule, states}) => { //NOTE: unsure about this one so I just added "states to it"
  const navigate = useNavigate();
  const completeProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'Users', user.uid);
        await updateDoc(userDocRef, { profileCompleted: true });
        await updateDoc(userDocRef, states);
        navigate('/group-hub'); // Navigate to the Join/Create Group page
        }
      } catch (err) {
        console.error("Error updating profile completion status:", err);
      }
  };
  return (
    <div className="profile-summary">
      <h1 className="profile-summary-title">Profile Summary</h1>
      <div className="profile-header">
        <img src={states.profilePicture} alt={`${states.name}'s Profile`} className="profile-picture" style={{ borderColor: states.highlightColor }} />
        <h2>{states.name}</h2>
      </div>

      {/* Gender */}
      <p><strong>Gender:</strong> {states.gender}</p>

      {/* Bio */}
      <div className="bio-section">
        <h3>Bio</h3>
        <p>{states.bio}</p>

      </div>

      {/* Interests
      <div className="interests-section">
        <h3>Interests</h3>
        <ul>
          {selectedInterests.map((interest, index) => (
            <li key={index}>{interest}</li>
          ))}
        </ul>
      </div> */}

      {/* Schedule */}
      <div className="schedule-section">
        <h3>Schedule</h3>
        <p>{JSON.stringify(states.availability)}</p>
      </div>
      <div className="button-group">
        <button className="next-btn" onClick={completeProfile}>Finish Profile</button>
        <button className="back-btn" onClick={prevStep}>Back</button>
      </div>
    </div>
  );
};
//
//
const ProfileMaker = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

  const [profilePicture, setProfilePicture] = useState(null); // Initialize profilePicture state
  const [highlightColor, setHighlightColor] = useState('#FF6347'); // Default highlight color (Tomato)
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = {}; 
      timeBlocks.forEach((time) => {
        acc[day][time] = false; // All time blocks are unselected by default
      });
      return acc;
    }, {})
  );

  
  const handleGroupSelection = (groupId) => {
    // Here, implement the logic for joining the group by ID
    // var userDocRef = doc(db, 'Users', user.uid);
    // var groupDocRef = doc(db, 'Groups', groupId);

    // const updateUser = await updateDoc(doc(db,"Users",user.uid),
    //   {groups: arrayUnion(groupDocRef)}
    // )

    // const updateGroup = await updateDoc(docRef,
    //   {members: arrayUnion(userDocRef)}
    // )
    alert(`Joined group with ID: ${groupId}`);
    nextStep();
  };

  const handleJoinWithCode = (code) => {
    // Add logic to verify the code and join the group if valid
    alert(`Attempting to join with code: ${code}`);
    // For now, treat group IDs as group codes :)
    nextStep();
  };

  const nextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prevStep) => prevStep - 1);
  };
  
  
  const steps = [
    <WelcomeMessage nextStep={nextStep} />,
    <ProfileName name={name} setName={setName} nextStep={nextStep} />,
    <GenderSelector nextStep={nextStep} prevStep={prevStep}  />,
    <ProfilePictureSetup nextStep={nextStep} prevStep={prevStep}  name={name} setProfilePicture={setProfilePicture} setHighlightColor={setHighlightColor}/>,
    <BioSetup bio={bio} setBio={setBio} nextStep={nextStep} prevStep={prevStep}  />,
    <InterestSelector
      nextStep={nextStep}
      prevStep={prevStep}
      selectedInterests={selectedInterests}
      setSelectedInterests={setSelectedInterests}
    />,
    <ScheduleSelector nextStep={nextStep} prevStep={prevStep} availability={availability} setAvailability={setAvailability} />,
    <ProfileSummary prevStep={prevStep} states={
      {
        name: name,
        bio: bio,
        profilePicture: profilePicture,
        selectedInterests: selectedInterests,
        highlightColor: highlightColor,
        availability: availability
      }      
    } />,
    // Add other steps (School, Bio, etc.)
  ];
  
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;


  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        nextStep();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="profile-maker-wrapper">
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      {steps[currentStep]}
    </div>
  );
};

export default ProfileMaker;