class User {
  final int id;
  final String firstName;
  final String? lastName;
  final String? username;
  final String? photoUrl;

  User({
    required this.id,
    required this.firstName,
    this.lastName,
    this.username,
    this.photoUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      username: json['username'],
      photoUrl: json['photo_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'username': username,
      'photo_url': photoUrl,
    };
  }
}
