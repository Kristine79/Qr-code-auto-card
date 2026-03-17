import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    // Get origin from request headers to ensure correct URL (dev vs shared)
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const origin = `${protocol}://${host}`;
    
    const appUrl = process.env.APP_URL || origin;

    if (!token) {
      return NextResponse.json({ error: 'Telegram Bot Token не задан в настройках' }, { status: 500 });
    }

    // 1. Validate token first
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();
    
    if (!meData.ok) {
      return NextResponse.json({ error: 'Неверный токен бота: ' + (meData.description || 'неизвестная ошибка') }, { status: 400 });
    }

    // 2. Set webhook with clean URL
    const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram/webhook`;
    
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 400 });
    }

    // 3. Устанавливаем кнопку меню (Menu Button) для открытия Web App
    await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Открыть CarQR',
          web_app: { url: appUrl }
        }
      })
    });

    return NextResponse.json({ success: true, url: webhookUrl });
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
