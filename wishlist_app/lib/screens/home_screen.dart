import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/wishlist_bloc.dart';
import '../blocs/wishlist_state.dart';
import '../widgets/landing_view.dart';
import '../widgets/events_list_view.dart';
import '../widgets/event_detail_view.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      body: BlocBuilder<WishlistBloc, WishlistState>(
        builder: (context, state) {
          if (state is WishlistLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is MyEventsLoaded) {
            if (state.events.isEmpty) {
              return const LandingView();
            }
            return EventsListView(events: state.events, user: state.user);
          } else if (state is EventDetailLoaded) {
            return EventDetailView(event: state.event, wishes: state.wishes, user: state.user);
          } else if (state is WishlistError) {
            return Center(child: Text(state.message));
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
