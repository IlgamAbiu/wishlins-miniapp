import 'package:equatable/equatable.dart';
import '../models/user.dart';
import '../models/event.dart';
import '../models/wish.dart';

abstract class WishlistState extends Equatable {
  @override
  List<Object?> get props => [];
}

class WishlistInitial extends WishlistState {}

class WishlistLoading extends WishlistState {}

class MyEventsLoaded extends WishlistState {
  final User user;
  final List<Event> events;
  MyEventsLoaded({required this.user, required this.events});
  @override
  List<Object?> get props => [user, events];
}

class EventDetailLoaded extends WishlistState {
  final User user;
  final Event event;
  final List<Wish> wishes;
  EventDetailLoaded({required this.user, required this.event, required this.wishes});
  @override
  List<Object?> get props => [user, event, wishes];
}

class WishlistError extends WishlistState {
  final String message;
  WishlistError(this.message);
}
