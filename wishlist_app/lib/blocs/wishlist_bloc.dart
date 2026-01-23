import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telegram_web_app/telegram_web_app.dart';
import '../repositories/wishlist_repository.dart';
import '../models/user.dart' as model;
import 'wishlist_event.dart';
import 'wishlist_state.dart';

class WishlistBloc extends Bloc<WishlistEvent, WishlistState> {
  final WishlistRepository repository;
  model.User? _currentUser;

  WishlistBloc({required this.repository}) : super(WishlistInitial()) {
    on<AppStarted>(_onAppStarted);
    on<LoadMyEvents>(_onLoadMyEvents);
    on<SelectEvent>(_onSelectEvent);
    on<BackToList>(_onBackToList);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<WishlistState> emit) async {
    emit(WishlistLoading());
    
    // Mock user for dev, in production use TelegramWebApp
    _currentUser = model.User(id: 123, firstName: 'Dev');
    
    try {
      final tgUser = TelegramWebApp.instance.initDataUnsafe.user;
      if (tgUser != null) {
        _currentUser = model.User(
          id: tgUser.id,
          firstName: tgUser.firstName,
          lastName: tgUser.lastName,
          username: tgUser.username,
          photoUrl: tgUser.photoUrl,
        );
      }
    } catch (_) {}

    await repository.syncUser(_currentUser!);
    add(LoadMyEvents(_currentUser!.id));
  }

  Future<void> _onLoadMyEvents(LoadMyEvents event, Emitter<WishlistState> emit) async {
    try {
      final events = await repository.getMyEvents(event.userId);
      emit(MyEventsLoaded(user: _currentUser!, events: events));
    } catch (e) {
      emit(WishlistError('Failed to load events: $e'));
    }
  }

  Future<void> _onSelectEvent(SelectEvent event, Emitter<WishlistState> emit) async {
    emit(WishlistLoading());
    try {
      final eventData = await repository.getEvent(event.eventId);
      final wishes = await repository.getWishes(event.eventId);
      emit(EventDetailLoaded(user: _currentUser!, event: eventData, wishes: wishes));
    } catch (e) {
      emit(WishlistError('Failed to load event details: $e'));
    }
  }

  void _onBackToList(BackToList event, Emitter<WishlistState> emit) {
    if (_currentUser != null) {
      add(LoadMyEvents(_currentUser!.id));
    }
  }
}
