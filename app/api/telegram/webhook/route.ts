import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.error('Telegram Webhook: No token found');
      return NextResponse.json({ ok: true });
    }

    // Handle both messages and callback queries
    const message = body.message || body.callback_query?.message;
    const callbackData = body.callback_query?.data;
    
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text;
    const firstName = message.chat.first_name || 'водитель';
    const appUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;

    const sendMessage = async (messageText: string, replyMarkup?: any) => {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          }),
        });
      } catch (e) {
        console.error('Error sending message:', e);
      }
    };

    // Response for /start or help button
    if (text === '/start' || callbackData === 'help_info') {
      const responseText = `👋 <b>Привет, ${firstName}!</b>\n\nЯ помогу тебе создать цифровую QR-визитку для твоего автомобиля.\n\nНажми на кнопку ниже, чтобы открыть конструктор прямо здесь!`;
      
      const replyMarkup = {
        inline_keyboard: [
          [
            { 
              text: '🚀 Открыть конструктор', 
              web_app: { url: appUrl } 
            }
          ]
        ]
      };

      await sendMessage(responseText, replyMarkup);
    } 
    
    else if (text === '/help' || callbackData === 'help_info') {
      const helpText = `📖 <b>Как пользоваться CarQR:</b>\n\n1. Перейди в конструктор.\n2. Заполни данные своего авто.\n3. В поле "Оповещения" (если оно включено) вставь свой ID: <code>${chatId}</code>.\n4. Скачай QR-код и распечатай его.\n\nЯ буду присылать уведомления, если ты включишь их в конструкторе!`;
      await sendMessage(helpText);
    }

    else {
      // Default response for any other message
      const defaultText = `Ваш Chat ID: <code>${chatId}</code>\n\nИспользуйте его на сайте для настройки уведомлений. Нажмите кнопку ниже, чтобы открыть конструктор.`;
      const replyMarkup = {
        inline_keyboard: [
          [{ text: '📱 Открыть CarQR', web_app: { url: appUrl } }]
        ]
      };
      await sendMessage(defaultText, replyMarkup);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
