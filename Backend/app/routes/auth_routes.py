# # Backend/app/routes/auth_routes.py
# # Authentication routes for login, register, logout functionality

# from fastapi import APIRouter, HTTPException, Depends, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from pydantic import BaseModel, EmailStr
# from typing import Optional, Dict, Any
# import json
# import os
# import bcrypt
# import secrets
# from datetime import datetime, timedelta
# import logging

# # Set up router and logging
# router = APIRouter()
# logger = logging.getLogger(__name__)
# security = HTTPBearer()

# # Path to our simple JSON database file
# DATABASE_FILE = "users_db.json"

# # Pydantic models for request/response data validation
# class LoginRequest(BaseModel):
#     """Data model for login requests"""
#     username: str  # Can be username or email
#     password: str

# class RegisterRequest(BaseModel):
#     """Data model for user registration"""
#     username: str
#     email: EmailStr
#     password: str
#     first_name: str
#     last_name: str

# class UserResponse(BaseModel):
#     """Data model for user information responses"""
#     id: str
#     username: str
#     email: str
#     first_name: str
#     last_name: str
#     profile_picture: Optional[str]
#     created_at: str
#     last_login: str
#     is_active: bool

# class LoginResponse(BaseModel):
#     """Data model for successful login responses"""
#     success: bool
#     message: str
#     user: UserResponse
#     access_token: str
#     token_type: str = "Bearer"

# # Helper functions for database operations
# def load_database() -> Dict[str, Any]:
#     """Load user data from JSON file"""
#     try:
#         if os.path.exists(DATABASE_FILE):
#             with open(DATABASE_FILE, 'r') as f:
#                 return json.load(f)
#         else:
#             # Create empty database if file doesn't exist
#             return {"users": [], "sessions": []}
#     except Exception as e:
#         logger.error(f"Error loading database: {e}")
#         return {"users": [], "sessions": []}

# def save_database(data: Dict[str, Any]) -> bool:
#     """Save user data to JSON file"""
#     try:
#         with open(DATABASE_FILE, 'w') as f:
#             json.dump(data, f, indent=2)
#         return True
#     except Exception as e:
#         logger.error(f"Error saving database: {e}")
#         return False

# def hash_password(password: str) -> str:
#     """Hash a password using bcrypt"""
#     salt = bcrypt.gensalt()
#     hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
#     return hashed.decode('utf-8')

# def verify_password(password: str, hashed: str) -> bool:
#     """Verify a password against its hash"""
#     return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# def find_user_by_username_or_email(username: str, db_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
#     """Find a user by username or email"""
#     for user in db_data["users"]:
#         if user["username"] == username or user["email"] == username:
#             return user
#     return None

# def create_session(user_id: str, db_data: Dict[str, Any]) -> str:
#     """Create a new session for a user"""
#     session_id = f"sess_{secrets.token_urlsafe(32)}"
#     expires_at = datetime.now() + timedelta(days=7)  # Session expires in 7 days
    
#     session = {
#         "session_id": session_id,
#         "user_id": user_id,
#         "created_at": datetime.now().isoformat(),
#         "expires_at": expires_at.isoformat(),
#         "is_active": True
#     }
    
#     db_data["sessions"].append(session)
#     return session_id

# def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
#     """Get user information from session token"""
#     db_data = load_database()
    
#     # Find active session
#     for session in db_data["sessions"]:
#         if session["session_id"] == token and session["is_active"]:
#             # Check if session is expired
#             expires_at = datetime.fromisoformat(session["expires_at"])
#             if datetime.now() > expires_at:
#                 # Session expired, deactivate it
#                 session["is_active"] = False
#                 save_database(db_data)
#                 return None
            
#             # Find user by ID
#             for user in db_data["users"]:
#                 if user["id"] == session["user_id"]:
#                     return user
    
#     return None

# # Authentication Routes

# @router.post("/login", response_model=LoginResponse)
# async def login(request: LoginRequest):
#     """
#     User login endpoint
#     Accepts username/email and password, returns user info and access token
#     """
#     try:
#         logger.info(f"🔐 Login attempt for: {request.username}")
        
#         # Load database
#         db_data = load_database()
        
#         # Find user by username or email
#         user = find_user_by_username_or_email(request.username, db_data)
        
#         if not user:
#             logger.warning(f"❌ Login failed: User not found for {request.username}")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid username/email or password"
#             )
        
#         # Verify password
#         if not verify_password(request.password, user["password_hash"]):
#             logger.warning(f"❌ Login failed: Invalid password for {request.username}")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid username/email or password"
#             )
        
#         # Check if user is active
#         if not user["is_active"]:
#             logger.warning(f"❌ Login failed: Account disabled for {request.username}")
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Account is disabled"
#             )
        
#         # Update last login time
#         user["last_login"] = datetime.now().isoformat()
        
#         # Create session token
#         access_token = create_session(user["id"], db_data)
        
#         # Save updated database
#         save_database(db_data)
        
#         # Create user response (without password hash)
#         user_response = UserResponse(
#             id=user["id"],
#             username=user["username"],
#             email=user["email"],
#             first_name=user["first_name"],
#             last_name=user["last_name"],
#             profile_picture=user.get("profile_picture"),
#             created_at=user["created_at"],
#             last_login=user["last_login"],
#             is_active=user["is_active"]
#         )
        
#         logger.info(f"✅ Login successful for: {request.username}")
        
#         return LoginResponse(
#             success=True,
#             message="Login successful",
#             user=user_response,
#             access_token=access_token
#         )
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"💥 Login error: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="An error occurred during login"
#         )

# @router.post("/register")
# async def register(request: RegisterRequest):
#     """
#     User registration endpoint
#     Creates a new user account with hashed password
#     """
#     try:
#         logger.info(f"📝 Registration attempt for: {request.username}")
        
#         # Load database
#         db_data = load_database()
        
#         # Check if username already exists
#         if find_user_by_username_or_email(request.username, db_data):
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Username already exists"
#             )
        
#         # Check if email already exists
#         if find_user_by_username_or_email(request.email, db_data):
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email already registered"
#             )
        
#         # Generate new user ID
#         user_id = str(len(db_data["users"]) + 1)
        
#         # Hash password
#         password_hash = hash_password(request.password)
        
#         # Create new user
#         new_user = {
#             "id": user_id,
#             "username": request.username,
#             "email": request.email,
#             "password_hash": password_hash,
#             "first_name": request.first_name,
#             "last_name": request.last_name,
#             "profile_picture": None,
#             "created_at": datetime.now().isoformat(),
#             "last_login": datetime.now().isoformat(),
#             "is_active": True,
#             "settings": {
#                 "notifications": {
#                     "email": True,
#                     "push": False,
#                     "sms": False
#                 },
#                 "privacy": {
#                     "profile_visibility": "public",
#                     "data_collection": True,
#                     "analytics": False
#                 },
#                 "preferences": {
#                     "theme": "dark",
#                     "language": "english",
#                     "autoplay": False,
#                     "font_size": "medium"
#                 }
#             }
#         }
        
#         # Add user to database
#         db_data["users"].append(new_user)
        
#         # Save database
#         save_database(db_data)
        
#         logger.info(f"✅ Registration successful for: {request.username}")
        
#         return {
#             "success": True,
#             "message": "Registration successful",
#             "user_id": user_id
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"💥 Registration error: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="An error occurred during registration"
#         )

# @router.post("/logout")
# async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
#     """
#     User logout endpoint
#     Deactivates the current session token
#     """
#     try:
#         token = credentials.credentials
#         logger.info(f"🚪 Logout attempt with token: {token[:20]}...")
        
#         # Load database
#         db_data = load_database()
        
#         # Find and deactivate session
#         session_found = False
#         for session in db_data["sessions"]:
#             if session["session_id"] == token:
#                 session["is_active"] = False
#                 session_found = True
#                 break
        
#         if not session_found:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid session token"
#             )
        
#         # Save database
#         save_database(db_data)
        
#         logger.info("✅ Logout successful")
        
#         return {
#             "success": True,
#             "message": "Logout successful"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"💥 Logout error: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="An error occurred during logout"
#         )

# @router.get("/me", response_model=UserResponse)
# async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
#     """
#     Get current user information from session token
#     Used to check if user is still logged in
#     """
#     try:
#         token = credentials.credentials
        
#         # Get user from token
#         user = get_user_from_token(token)
        
#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid or expired session token"
#             )
        
#         # Return user information
#         return UserResponse(
#             id=user["id"],
#             username=user["username"],
#             email=user["email"],
#             first_name=user["first_name"],
#             last_name=user["last_name"],
#             profile_picture=user.get("profile_picture"),
#             created_at=user["created_at"],
#             last_login=user["last_login"],
#             is_active=user["is_active"]
#         )
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"💥 Get current user error: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="An error occurred while fetching user information"
#         )

# @router.get("/settings/{user_id}")
# async def get_user_settings(user_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
#     """
#     Get user settings for the settings page
#     """
#     try:
#         # Verify user is authenticated and accessing their own settings
#         current_user = get_user_from_token(credentials.credentials)
        
#         if not current_user or current_user["id"] != user_id:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Access denied"
#             )
        
#         return {
#             "success": True,
#             "settings": current_user["settings"]
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"💥 Get settings error: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="An error occurred while fetching settings"
#         )

# @router.put("/settings/{user_id}")
# async def update_user_settings(
#     user_id: str, 
#     settings: Dict[str, Any], 
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Update user settings from the settings page
#     """
#     try:
#         # Verify user is authenticated and updating their own settings
#         current_user = get_user_from_token(credentials.credentials)
        
#         if not current_user or current_user["id"] != user_id:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Access denied"
#             )
        
#         # Load database
#         db_data = load_database()
        
#         # Find and update user settings
#         for user in db_data["users"]:
#             if user["id"] == user_id:
#                 user["settings"] = settings
#                 break
        
#         # Save database
#         save_database(db_data)
        
#         return {
#             "success": True,
#             "message": "Settings updated successfully"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"💥 Update settings error: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="An error occurred while updating settings"
#         )





# Backend/app/routes/auth_routes.py
# Updated authentication routes with country of interest support
# Backend/app/routes/auth_routes.py
# Fixed authentication routes with proper session handling

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import json
import os
import bcrypt
import secrets
from datetime import datetime, timedelta
import logging

# Set up router and logging
router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()

# Path to our simple JSON database file
DATABASE_FILE = "users_db.json"

# Updated Pydantic models with country support
class LoginRequest(BaseModel):
    """Data model for login requests"""
    username: str  # Can be username or email
    password: str

class RegisterRequest(BaseModel):
    """Data model for user registration - NOW WITH COUNTRY SUPPORT"""
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    country_of_interest: str  # NEW: Required during registration

class UserResponse(BaseModel):
    """Data model for user information responses - NOW WITH COUNTRY"""
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    country_of_interest: str  # NEW: Country they want news from
    profile_picture: Optional[str]
    created_at: str
    last_login: str
    is_active: bool

class LoginResponse(BaseModel):
    """Data model for successful login responses"""
    success: bool
    message: str
    user: UserResponse
    access_token: str
    token_type: str = "Bearer"

# Country validation list - Updated with specific African countries
VALID_COUNTRIES = [
    'ZW',  # Zimbabwe
    'KE',  # Kenya
    'GH',  # Ghana
    'RW',  # Rwanda
    'CD',  # Democratic Republic of Congo
    'ZA',  # South Africa
    'BI'   # Burundi
]

# FIXED: Enhanced database loading with proper structure validation
def load_database() -> Dict[str, Any]:
    """
    Load user data from JSON file with proper structure validation
    This ensures both 'users' and 'sessions' keys always exist
    """
    try:
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r') as f:
                data = json.load(f)
                
            # CRITICAL FIX: Ensure both required keys exist
            # This prevents the 'sessions' KeyError that was causing your 500 error
            if "users" not in data:
                data["users"] = []
                logger.warning("⚠️ Added missing 'users' key to database")
                
            if "sessions" not in data:
                data["sessions"] = []
                logger.warning("⚠️ Added missing 'sessions' key to database")
                # Save the corrected structure back to file
                save_database(data)
                
            return data
        else:
            # Create empty database with proper structure if file doesn't exist
            logger.info("📁 Creating new database file with proper structure")
            default_data = {"users": [], "sessions": []}
            save_database(default_data)
            return default_data
            
    except json.JSONDecodeError as e:
        logger.error(f"💥 JSON decode error in database file: {e}")
        # Create backup of corrupted file and start fresh
        backup_name = f"{DATABASE_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        if os.path.exists(DATABASE_FILE):
            os.rename(DATABASE_FILE, backup_name)
            logger.info(f"📦 Corrupted database backed up as: {backup_name}")
        return {"users": [], "sessions": []}
        
    except Exception as e:
        logger.error(f"💥 Unexpected error loading database: {e}")
        return {"users": [], "sessions": []}

def save_database(data: Dict[str, Any]) -> bool:
    """
    Save user data to JSON file with error handling
    """
    try:
        # Ensure the data has the correct structure before saving
        if "users" not in data:
            data["users"] = []
        if "sessions" not in data:
            data["sessions"] = []
            
        with open(DATABASE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"💥 Error saving database: {e}")
        return False

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt for secure storage
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against its hash using bcrypt
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def find_user_by_username_or_email(username: str, db_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Find a user by username or email address
    This allows users to login with either their username or email
    """
    for user in db_data["users"]:
        if user["username"] == username or user["email"] == username:
            return user
    return None

def create_session(user_id: str, db_data: Dict[str, Any]) -> str:
    """
    Create a new session for a user after successful login
    Returns a secure session token that expires in 7 days
    """
    # Generate a cryptographically secure session ID
    session_id = f"sess_{secrets.token_urlsafe(32)}"
    expires_at = datetime.now() + timedelta(days=7)  # Session expires in 7 days
    
    # Create session object with all necessary info
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "expires_at": expires_at.isoformat(),
        "is_active": True
    }
    
    # FIXED: This line was failing because 'sessions' key didn't exist
    # Now it's guaranteed to exist thanks to our improved load_database function
    db_data["sessions"].append(session)
    return session_id

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from session token
    Validates token and checks expiration
    """
    db_data = load_database()
    
    # Find active session matching the provided token
    for session in db_data["sessions"]:
        if session["session_id"] == token and session["is_active"]:
            # Check if session has expired
            expires_at = datetime.fromisoformat(session["expires_at"])
            if datetime.now() > expires_at:
                # Session expired, deactivate it automatically
                session["is_active"] = False
                save_database(db_data)
                logger.info(f"🕐 Session expired and deactivated: {token[:20]}...")
                return None
            
            # Find the user associated with this session
            for user in db_data["users"]:
                if user["id"] == session["user_id"]:
                    return user
    
    return None

# MAIN AUTHENTICATION ROUTES

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    User login endpoint - UPDATED to include country in response
    Validates credentials and creates a new session
    """
    try:
        logger.info(f"🔐 Login attempt for: {request.username}")
        
        # Load database (now guaranteed to have proper structure)
        db_data = load_database()
        
        # Find user by username or email
        user = find_user_by_username_or_email(request.username, db_data)
        
        if not user:
            logger.warning(f"❌ Login failed: User not found for {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        # Verify the provided password against stored hash
        if not verify_password(request.password, user["password_hash"]):
            logger.warning(f"❌ Login failed: Invalid password for {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        # Check if user account is active
        if not user["is_active"]:
            logger.warning(f"❌ Login failed: Account disabled for {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is disabled"
            )
        
        # Update user's last login timestamp
        user["last_login"] = datetime.now().isoformat()
        
        # Create new session token (this will now work properly)
        access_token = create_session(user["id"], db_data)
        
        # Save updated database with new session and login time
        save_database(db_data)
        
        # Create user response object (excludes sensitive password hash)
        user_response = UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            country_of_interest=user.get("country_of_interest", "ZW"),  # Default to Zimbabwe if missing
            profile_picture=user.get("profile_picture"),
            created_at=user["created_at"],
            last_login=user["last_login"],
            is_active=user["is_active"]
        )
        
        logger.info(f"✅ Login successful for: {request.username}")
        
        return LoginResponse(
            success=True,
            message="Login successful",
            user=user_response,
            access_token=access_token
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 401 Unauthorized)
        raise
    except Exception as e:
        # Log unexpected errors and return 500
        logger.error(f"💥 Unexpected login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

@router.post("/register")
async def register(request: RegisterRequest):
    """
    User registration endpoint with country support
    Creates a new user account with hashed password
    """
    try:
        logger.info(f"📝 Registration attempt for: {request.username}")
        
        # Validate country is in our supported list
        if request.country_of_interest not in VALID_COUNTRIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid country. Must be one of: {', '.join(VALID_COUNTRIES)}"
            )
        
        # Load database
        db_data = load_database()
        
        # Check if username already exists
        if find_user_by_username_or_email(request.username, db_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Check if email already exists
        if find_user_by_username_or_email(request.email, db_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate new user ID (simple incremental approach)
        user_id = str(len(db_data["users"]) + 1)
        
        # Hash the password securely
        password_hash = hash_password(request.password)
        
        # Create new user object with all required fields
        new_user = {
            "id": user_id,
            "username": request.username,
            "email": request.email,
            "password_hash": password_hash,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "country_of_interest": request.country_of_interest,  # Store user's country preference
            "profile_picture": None,
            "created_at": datetime.now().isoformat(),
            "last_login": datetime.now().isoformat(),
            "is_active": True,
            "settings": {
                "notifications": {
                    "email": True,
                    "push": False,
                    "sms": False
                },
                "privacy": {
                    "profile_visibility": "public",
                    "data_collection": True,
                    "analytics": False
                },
                "preferences": {
                    "theme": "dark",
                    "language": "english",
                    "autoplay": False,
                    "font_size": "medium",
                    "country_focus": request.country_of_interest  # Also store in preferences
                }
            }
        }
        
        # Add user to database
        db_data["users"].append(new_user)
        
        # Save database
        save_database(db_data)
        
        logger.info(f"✅ Registration successful for: {request.username} with country: {request.country_of_interest}")
        
        return {
            "success": True,
            "message": f"Registration successful! You can now log in with your credentials."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    User logout endpoint
    Deactivates the current session token
    """
    try:
        token = credentials.credentials
        logger.info(f"🚪 Logout attempt with token: {token[:20]}...")
        
        # Load database
        db_data = load_database()
        
        # Find and deactivate session
        session_found = False
        for session in db_data["sessions"]:
            if session["session_id"] == token:
                session["is_active"] = False
                session_found = True
                break
        
        if not session_found:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token"
            )
        
        # Save database
        save_database(db_data)
        
        logger.info("✅ Logout successful")
        
        return {
            "success": True,
            "message": "Logout successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during logout"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current user information from session token
    Used to check if user is still logged in and get user details
    """
    try:
        token = credentials.credentials
        
        # Get user from token (includes expiration check)
        user = get_user_from_token(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        # Return user information (without password hash)
        return UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            country_of_interest=user.get("country_of_interest", "ZW"),  # Default to Zimbabwe
            profile_picture=user.get("profile_picture"),
            created_at=user["created_at"],
            last_login=user["last_login"],
            is_active=user["is_active"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching user information"
        )