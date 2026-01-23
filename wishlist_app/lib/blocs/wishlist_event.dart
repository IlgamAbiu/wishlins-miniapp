import 'package:equatable/equatable.dart';
import '../models/user.dart';

abstract class WishlistEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class AppStarted extends WishlistEvent {}

class LoadMyEvents extends WishlistEvent {
  final int userId;
  LoadMyEvents(this.userId);
  @override
  List<Object?> get props => [userId];
}

class SelectEvent extends WishlistEvent {
  final int eventId;
  SelectEvent(this.eventId);
  @override
  List<Object?> get props => [eventId];
}

class CreateEventRequested extends WishlistEvent {
  final String title;
  final String? date;
  final String? description;
  CreateEventRequested({required this.title, this.date, this.description});
}

class BackToList extends WishlistEvent {}
