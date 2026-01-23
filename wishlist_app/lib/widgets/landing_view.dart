import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/wishlist_bloc.dart';
import '../blocs/wishlist_event.dart';
import 'event_dialog.dart';

class LandingView extends StatelessWidget {
  const LandingView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          children: [
            const SizedBox(height: 60),
            // Gift Icon
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  )
                ],
              ),
              padding: const EdgeInsets.all(16),
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xffa855f7), Color(0xfff43f5e)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(LucideIcons.gift, color: Colors.white, size: 30),
              ),
            ),
            const SizedBox(height: 32),
            // Title
            ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [Color(0xffa855f7), Color(0xfff43f5e)],
              ).createShader(bounds),
              child: const Text(
                'Wishful Thinking',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -1,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Create wishlists. Share joy.\nGet gifts you\'ll love.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Color(0xff475569),
                height: 1.3,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'No more awkward guessing games. Share your wishes with friends and family.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Color(0xff94a3b8),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 48),
            // Buttons
            ElevatedButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (dialogContext) => EventDialog(
                    onSave: (title, date, desc) {
                      context.read<WishlistBloc>().add(CreateEventRequested(
                        title: title,
                        date: date,
                        description: desc,
                      ));
                    },
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.zero,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
              ),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xffa855f7), Color(0xfff43f5e)],
                  ),
                  borderRadius: BorderRadius.circular(100),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xfff43f5e).withOpacity(0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: const Center(
                  child: Text(
                    '✨ Create Your Wishlist →',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 60),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                side: const BorderSide(color: Color(0xfff1f5f9)),
                backgroundColor: Colors.white,
              ),
              child: const Text(
                'View Demo',
                style: TextStyle(color: Color(0xff475569), fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 48),
            // Feature cards
            _buildFeatureCard(
              LucideIcons.gift,
              'Easy to Create',
              'Add items in seconds with photos, links, and prices',
              const Color(0xfff3e8ff),
            ),
            const SizedBox(height: 16),
            _buildFeatureCard(
              LucideIcons.heart,
              'Simple Sharing',
              'One link, endless possibilities. Share anywhere',
              const Color(0xfffce7f3),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard(IconData icon, String title, String description, Color bgColor) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xfff8fafc)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: const Color(0xffa855f7), size: 24),
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xff1e293b))),
          const SizedBox(height: 8),
          Text(description, style: const TextStyle(fontSize: 14, color: Color(0xff64748b), height: 1.4)),
        ],
      ),
    );
  }
}
