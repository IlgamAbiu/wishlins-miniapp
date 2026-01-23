class Wish {
  final int id;
  final int eventId;
  final String title;
  final String? url;
  final double? price;
  final String currency;
  final int priority;
  final String? comment;
  final String? imageUrl;
  final bool isBooked;
  final int? bookedByUserId;

  Wish({
    required this.id,
    required this.eventId,
    required this.title,
    this.url,
    this.price,
    this.currency = 'RUB',
    this.priority = 1,
    this.comment,
    this.imageUrl,
    this.isBooked = false,
    this.bookedByUserId,
  });

  factory Wish.fromJson(Map<String, dynamic> json) {
    return Wish(
      id: json['id'],
      eventId: json['event_id'],
      title: json['title'],
      url: json['url'],
      price: json['price']?.toDouble(),
      currency: json['currency'] ?? 'RUB',
      priority: json['priority'] ?? 1,
      comment: json['comment'],
      imageUrl: json['image_url'],
      isBooked: json['is_booked'] == 1,
      bookedByUserId: json['booked_by_user_id'],
    );
  }
}
