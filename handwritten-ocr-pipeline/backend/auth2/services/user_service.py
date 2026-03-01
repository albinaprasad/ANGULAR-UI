from ..dtos.user_registeration import UserRegistration
from django.contrib.auth import get_user_model
User = get_user_model()

from ..exceptions.user_already_exist import UserAlreadyExist
from ..dtos.user_login import UserLogin
from ..jwt_utils import create_jwt_token
from django.contrib.auth.models import Group
from ..exceptions.no_default_group import NoDefaultGroup


class UserService:

    def register(self, data):
        
        userRegisteration = UserRegistration()
        userRegisteration.serialize(data)

        if User.objects.filter(username=userRegisteration.username.value).exists():
            raise UserAlreadyExist("user already exists")
        
        # Determine role from request data (default: student)
        role = data.get("role", "student")
        if role not in ("student", "teacher"):
            role = "student"
        
        group = Group.objects.filter(name=role).first()

        if not group:
            raise NoDefaultGroup("DB is not setup properly")
        
        user = User.objects.create_user(username=userRegisteration.username.value,
                                         password=userRegisteration.password.value,
                                         email=userRegisteration.email.value,
                                         )
        user.groups.add(group)
        token = create_jwt_token(user=user)
        return {
            'message': 'User registered',
            'token': token 
        }
    
    def login(self, data):
        userLogin = UserLogin()
        userLogin.serialize(data=data)

    
    def get_group(self, user):
        return user.groups.all()
