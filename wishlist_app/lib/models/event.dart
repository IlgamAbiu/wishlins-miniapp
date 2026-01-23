import 'user.dart';

class Event {
  final int id;
  final int userId;
  final String title;
  final String? description;
  final String? date;
  final User? owner;

  Event({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    this.date,
    this.owner,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'],
      userId: json['user_id'],
      title: json['title'],
      description: json['description'],
      date: json['date'],
      owner: json['owner'] != null ? User.fromJson(json['owner']) : null,
    );
  }
}
