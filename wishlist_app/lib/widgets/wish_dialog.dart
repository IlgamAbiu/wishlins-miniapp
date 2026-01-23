import 'package:flutter/material.dart';

class WishDialog extends StatefulWidget {
  final Map<String, dynamic>? initialData;
  final Function(Map<String, dynamic> data) onSave;

  const WishDialog({super.key, this.initialData, required this.onSave});

  @override
  State<WishDialog> createState() => _WishDialogState();
}

class _WishDialogState extends State<WishDialog> {
  late TextEditingController _titleController;
  late TextEditingController _priceController;
  late TextEditingController _urlController;
  late TextEditingController _commentController;
  late TextEditingController _imageUrlController;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.initialData?['title']);
    _priceController = TextEditingController(text: widget.initialData?['price']?.toString());
    _urlController = TextEditingController(text: widget.initialData?['url']);
    _commentController = TextEditingController(text: widget.initialData?['comment']);
    _imageUrlController = TextEditingController(text: widget.initialData?['image_url']);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.initialData == null ? 'Новое желание' : 'Редактировать',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
              ),
              const SizedBox(height: 16),
              _buildField('Название*', _titleController, 'Напр. Наушники Sony'),
              const SizedBox(height: 12),
              _buildField('Цена', _priceController, 'Напр. 25000', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _buildField('Ссылка', _urlController, 'https://...'),
              const SizedBox(height: 12),
              _buildField('Фото (URL)', _imageUrlController, 'https://.../image.jpg'),
              const SizedBox(height: 12),
              _buildField('Комментарий', _commentController, 'Цвет, размер и т.д.', maxLines: 2),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  if (_titleController.text.isNotEmpty) {
                    widget.onSave({
                      'title': _titleController.text,
                      'price': double.tryParse(_priceController.text),
                      'url': _urlController.text,
                      'image_url': _imageUrlController.text,
                      'comment': _commentController.text,
                    });
                    Navigator.pop(context);
                  }
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                  backgroundColor: const Color(0xffa855f7),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(widget.initialData == null ? 'Добавить' : 'Сохранить', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, String hint, {int maxLines = 1, TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff94a3b8))),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: const TextStyle(fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xffcbd5e1), fontSize: 13),
            filled: true,
            fillColor: const Color(0xfff8fafc),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
      ],
    );
  }
}
