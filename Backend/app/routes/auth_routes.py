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
# Authentication routes with dynamic country support - no Zimbabwe defaults

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

# Path to our JSON database file
DATABASE_FILE = "users_db.json"

# Country validation - all 7 supported countries (no Zimbabwe preference)
VALID_COUNTRIES = [
    'ZW',  # Zimbabwe
    'KE',  # Kenya
    'GH',  # Ghana
    'RW',  # Rwanda
    'CD',  # Democratic Republic of Congo
    'ZA',  # South Africa
    'BI'   # Burundi
]

# Pydantic models for request/response validation
class LoginRequest(BaseModel):
    """Data model for user login requests"""
    username: str  # Can be username or email
    password: str

class RegisterRequest(BaseModel):
    """Data model for user registration - REQUIRES country selection"""
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    country_of_interest: str  # REQUIRED: User must select a country

class UserResponse(BaseModel):
    """Data model for user information responses - includes country"""
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    country_of_interest: str  # User's selected country for news
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

class CountryUpdateRequest(BaseModel):
    """Data model for country preference updates"""
    country_of_interest: str

# Database helper functions
def load_database() -> Dict[str, Any]:
    """
    Load user data from JSON database file
    Creates empty database if file doesn't exist
    """
    try:
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r') as f:
                return json.load(f)
        else:
            # Create empty database structure
            return {"users": [], "sessions": []}
    except Exception as e:
        logger.error(f"Error loading database: {e}")
        return {"users": [], "sessions": []}

def save_database(data: Dict[str, Any]) -> bool:
    """
    Save user data to JSON database file
    Returns True if successful, False otherwise
    """
    try:
        with open(DATABASE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving database: {e}")
        return False

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt for secure storage
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against its bcrypt hash
    
    Args:
        password: Plain text password to verify
        hashed: Stored password hash
        
    Returns:
        True if password matches hash
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def find_user_by_username_or_email(identifier: str, db_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Find a user by username or email address
    
    Args:
        identifier: Username or email to search for
        db_data: Database data dictionary
        
    Returns:
        User dictionary if found, None otherwise
    """
    for user in db_data["users"]:
        if user["username"] == identifier or user["email"] == identifier:
            return user
    return None

def create_session(user_id: str, db_data: Dict[str, Any]) -> str:
    """
    Create a new session token for a user
    
    Args:
        user_id: ID of the user to create session for
        db_data: Database data to add session to
        
    Returns:
        New session token string
    """
    # Generate secure session token
    session_id = f"sess_{secrets.token_urlsafe(32)}"
    expires_at = datetime.now() + timedelta(days=7)  # 7-day expiration
    
    # Create session record
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "expires_at": expires_at.isoformat(),
        "is_active": True
    }
    
    # Add to database
    db_data["sessions"].append(session)
    return session_id

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from session token
    Validates token and checks expiration
    
    Args:
        token: Session token to validate
        
    Returns:
        User dictionary if token is valid, None otherwise
    """
    if not token:
        return None
        
    db_data = load_database()
    
    # Find active session matching the token
    for session in db_data["sessions"]:
        if session["session_id"] == token and session["is_active"]:
            # Check if session has expired
            expires_at = datetime.fromisoformat(session["expires_at"])
            if datetime.now() > expires_at:
                # Session expired - deactivate it
                session["is_active"] = False
                save_database(db_data)
                return None
            
            # Find user by session's user_id
            for user in db_data["users"]:
                if user["id"] == session["user_id"]:
                    return user
    
    return None

# Authentication endpoint routes
@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    User login endpoint
    
    Validates credentials and returns user info with access token.
    User must have a valid country_of_interest to access news endpoints.
    
    Args:
        request: Login credentials (username/email and password)
        
    Returns:
        Login response with user info and access token
    """
    try:
        logger.info(f"🔐 Login attempt for: {request.username}")
        
        # Load database
        db_data = load_database()
        
        # Find user by username or email
        user = find_user_by_username_or_email(request.username, db_data)
        
        if not user:
            logger.warning(f"❌ Login failed: User not found for {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        # Verify password
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
                detail="Account is disabled. Please contact support."
            )
        
        # Check if user has a valid country preference
        user_country = user.get("country_of_interest")
        if not user_country or user_country not in VALID_COUNTRIES:
            logger.warning(f"❌ Login failed: Invalid country '{user_country}' for {request.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid country preference. Please contact support to update your account."
            )
        
        # Update last login timestamp
        user["last_login"] = datetime.now().isoformat()
        
        # Create new session token
        access_token = create_session(user["id"], db_data)
        
        # Save updated database
        save_database(db_data)
        
        # Create user response (excluding sensitive data like password hash)
        user_response = UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            country_of_interest=user["country_of_interest"],
            profile_picture=user.get("profile_picture"),
            created_at=user["created_at"],
            last_login=user["last_login"],
            is_active=user["is_active"]
        )
        
        logger.info(f"✅ Login successful for: {request.username} (Country: {user_country})")
        
        return LoginResponse(
            success=True,
            message="Login successful",
            user=user_response,
            access_token=access_token
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        logger.error(f"💥 Unexpected login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

@router.post("/register")
async def register(request: RegisterRequest):
    """
    User registration endpoint
    
    Creates new user account with required country selection.
    User MUST select a country during registration to access news.
    
    Args:
        request: Registration data including required country_of_interest
        
    Returns:
        Success message confirming registration
    """
    try:
        logger.info(f"📝 Registration attempt for: {request.username} (Country: {request.country_of_interest})")
        
        # Validate country selection is required and valid
        if not request.country_of_interest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Country selection is required during registration"
            )
        
        if request.country_of_interest not in VALID_COUNTRIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid country '{request.country_of_interest}'. Valid countries: {', '.join(VALID_COUNTRIES)}"
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
        
        # Generate new user ID
        user_id = str(len(db_data["users"]) + 1)
        
        # Hash password securely
        password_hash = hash_password(request.password)
        
        # Create new user with country preference
        new_user = {
            "id": user_id,
            "username": request.username,
            "email": request.email,
            "password_hash": password_hash,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "country_of_interest": request.country_of_interest,  # User's selected country
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
                    "country_focus": request.country_of_interest  # Store in preferences too
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
            "message": f"Registration successful! You'll receive news focused on {request.country_of_interest}",
            "user_id": user_id,
            "country_set": request.country_of_interest
        }
        
    except HTTPException:
        # Re-raise validation errors
        raise
    except Exception as e:
        logger.error(f"💥 Unexpected registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )

@router.put("/profile/country")
async def update_country_of_interest(
    country_data: CountryUpdateRequest, 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update user's country of interest preference
    
    This endpoint is called when user changes their country in settings page.
    All subsequent news requests will use the new country automatically.
    
    Args:
        country_data: New country preference
        credentials: User authentication token
        
    Returns:
        Success confirmation with new country
    """
    try:
        # Get current authenticated user
        current_user = get_user_from_token(credentials.credentials)
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token"
            )
        
        new_country = country_data.country_of_interest
        
        # Validate new country is supported
        if not new_country or new_country not in VALID_COUNTRIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid country '{new_country}'. Valid countries: {', '.join(VALID_COUNTRIES)}"
            )
        
        # Load database
        db_data = load_database()
        
        # Find and update user's country preference
        user_updated = False
        for user in db_data["users"]:
            if user["id"] == current_user["id"]:
                old_country = user.get("country_of_interest", "None")
                user["country_of_interest"] = new_country
                user["settings"]["preferences"]["country_focus"] = new_country
                user_updated = True
                logger.info(f"🌍 Country updated for {user['username']}: {old_country} → {new_country}")
                break
        
        if not user_updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )
        
        # Save updated database
        if not save_database(db_data):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save country preference"
            )
        
        logger.info(f"✅ Country preference updated successfully for user {current_user['username']}: {new_country}")
        
        return {
            "success": True,
            "message": f"Country preference updated to {new_country}",
            "country_of_interest": new_country,
            "effective_immediately": True  # News requests will use new country immediately
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"💥 Error updating country preference: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating country preference"
        )

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    User logout endpoint
    
    Deactivates the user's current session token.
    
    Args:
        credentials: User's current authentication token
        
    Returns:
        Success confirmation
    """
    try:
        logger.info("🚪 Logout attempt")
        
        # Get token from authorization header
        token = credentials.credentials
        
        # Load database
        db_data = load_database()
        
        # Find and deactivate the session
        session_found = False
        for session in db_data["sessions"]:
            if session["session_id"] == token and session["is_active"]:
                session["is_active"] = False
                session_found = True
                break
        
        if session_found:
            save_database(db_data)
            logger.info("✅ Logout successful - session deactivated")
        else:
            logger.warning("⚠️  Session not found during logout (may already be expired)")
        
        return {
            "success": True,
            "message": "Logout successful"
        }
        
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
    
    Used to verify authentication status and get user details including country preference.
    
    Args:
        credentials: User's authentication token
        
    Returns:
        Current user information including country_of_interest
    """
    try:
        token = credentials.credentials
        
        # Get user from token
        user = get_user_from_token(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        # Validate user has a country preference
        user_country = user.get("country_of_interest")
        if not user_country or user_country not in VALID_COUNTRIES:
            logger.warning(f"⚠️  User {user['username']} has invalid country: {user_country}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid country preference. Please update your settings."
            )
        
        # Return user information
        return UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            country_of_interest=user["country_of_interest"],
            profile_picture=user.get("profile_picture"),
            created_at=user["created_at"],
            last_login=user["last_login"],
            is_active=user["is_active"]
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"💥 Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching user information"
        )

@router.get("/countries")
async def get_available_countries():
    """
    Get list of all supported countries
    
    Used by frontend for country selection dropdowns in registration and settings.
    
    Returns:
        List of supported countries with codes, names, and flags
    """
    try:
        # Country information for frontend dropdowns
        countries_info = [
            {"code": "ZW", "name": "Zimbabwe", "flag": "🇿🇼"},
            {"code": "KE", "name": "Kenya", "flag": "🇰🇪"}, 
            {"code": "GH", "name": "Ghana", "flag": "🇬🇭"},
            {"code": "RW", "name": "Rwanda", "flag": "🇷🇼"},
            {"code": "CD", "name": "Democratic Republic of Congo", "flag": "🇨🇩"},
            {"code": "ZA", "name": "South Africa", "flag": "🇿🇦"},
            {"code": "BI", "name": "Burundi", "flag": "🇧🇮"}
        ]
        
        return {
            "success": True,
            "countries": countries_info,
            "valid_codes": VALID_COUNTRIES,
            "count": len(VALID_COUNTRIES),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting countries: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch available countries"
        )

@router.get("/settings")
async def get_user_settings(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current user's settings
    
    Returns all user settings including country preference and notification settings.
    
    Args:
        credentials: User's authentication token
        
    Returns:
        User's complete settings object
    """
    try:
        # Get current authenticated user
        current_user = get_user_from_token(credentials.credentials)
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token"
            )
        
        return {
            "success": True,
            "user_id": current_user["id"],
            "country_of_interest": current_user.get("country_of_interest"),
            "settings": current_user.get("settings", {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error getting user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching settings"
        )

@router.put("/settings")
async def update_user_settings(
    settings_data: Dict[str, Any], 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update user's settings
    
    Updates notification preferences and other settings.
    Note: Country changes should use the specific /profile/country endpoint.
    
    Args:
        settings_data: New settings to apply
        credentials: User's authentication token
        
    Returns:
        Success confirmation
    """
    try:
        # Get current authenticated user
        current_user = get_user_from_token(credentials.credentials)
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token"
            )
        
        # Load database
        db_data = load_database()
        
        # Find and update user settings
        user_updated = False
        for user in db_data["users"]:
            if user["id"] == current_user["id"]:
                # Update settings (but preserve country_of_interest)
                user["settings"] = settings_data.get("settings", user.get("settings", {}))
                user_updated = True
                break
        
        if not user_updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Save updated database
        if not save_database(db_data):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save settings"
            )
        
        logger.info(f"✅ Settings updated for user: {current_user['username']}")
        
        return {
            "success": True,
            "message": "Settings updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error updating settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating settings"
      )