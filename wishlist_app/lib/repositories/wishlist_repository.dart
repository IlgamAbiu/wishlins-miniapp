import 'package:dio/dio.dart';
import '../models/user.dart';
import '../models/event.dart';
import '../models/wish.dart';

class WishlistRepository {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://72.56.75.232:8000')); // Assuming default port for Python

  Future<void> syncUser(User user) async {
    await _dio.post('/api/auth', data: user.toJson());
  }

  Future<List<Event>> getMyEvents(int userId) async {
    final response = await _dio.get('/api/events/my', queryParameters: {'userId': userId});
    return (response.data as List).map((e) => Event.fromJson(e)).toList();
  }

  Future<Event> getEvent(int eventId) async {
    final response = await _dio.get('/api/events/$eventId');
    return Event.fromJson(response.data);
  }

  Future<Event> createEvent(int userId, String title, String? date, String? description) async {
    final response = await _dio.post('/api/events', data: {
      'userId': userId,
      'title': title,
      'date': date,
      'description': description,
    });
    return Event.fromJson(response.data);
  }

  Future<List<Wish>> getWishes(int eventId) async {
    final response = await _dio.get('/api/events/$eventId/wishes');
    return (response.data as List).map((e) => Wish.fromJson(e)).toList();
  }

  Future<void> createWish(Map<String, dynamic> data) async {
    await _dio.post('/api/wishes', data: data);
  }

  Future<void> updateWish(int wishId, Map<String, dynamic> data) async {
    await _dio.put('/api/wishes/$wishId', data: data);
  }

  Future<void> deleteWish(int wishId) async {
    await _dio.delete('/api/wishes/$wishId');
  }
}
