from rest_framework import serializers

from recruitments.models import User

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and request:
            data['avatar'] = request.build_absolute_uri(instance.avatar.url)
        return data

class UserSerializer(SimpleUserSerializer):
    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['id', 'username', 'role', 'password']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and request:
            data['avatar'] = request.build_absolute_uri(instance.avatar.url)
        return data

    def validate_role(self, role):
        if role.__eq__('admin'):
            raise serializers.ValidationError("Không được chọn role Admin")
        return role

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)

        user.is_staff = False
        user.is_superuser = False
        user.save()

        return user