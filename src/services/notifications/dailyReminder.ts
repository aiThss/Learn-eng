/**
 * Nhắc học hằng ngày chạy cục bộ trên Android, không cần server hay Internet.
 * Web/PWA không giả vờ hỗ trợ vì thông báo khi app đã đóng cần một push service riêng.
 */
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { UserSettings } from '@/types'

const DAILY_REMINDER_ID = 1001
const DAILY_REMINDER_CHANNEL = 'daily-study-reminders'

export type ReminderResult =
  | 'scheduled'
  | 'disabled'
  | 'permission-required'
  | 'permission-denied'
  | 'unsupported'
  | 'failed'

export function supportsDailyStudyReminder() {
  return Capacitor.getPlatform() === 'android'
}

function parseReminderTime(time: string) {
  const matchedTime = /^(\d{2}):(\d{2})$/.exec(time)
  const hour = Number(matchedTime?.[1])
  const minute = Number(matchedTime?.[2])

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { hour: 20, minute: 0 }
  }

  return { hour, minute }
}

/**
 * Lưu một lịch nhắc học duy nhất. Mỗi lần đổi giờ hoặc bật/tắt sẽ thay lịch cũ,
 * nhờ vậy không thể sinh nhiều thông báo trùng nhau.
 */
export async function syncDailyStudyReminder(
  settings: Pick<UserSettings, 'notificationsEnabled' | 'studyReminderTime'>,
  requestPermission = false,
): Promise<ReminderResult> {
  if (!supportsDailyStudyReminder()) return 'unsupported'

  try {
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] })

    if (!settings.notificationsEnabled) return 'disabled'

    let permission = await LocalNotifications.checkPermissions()
    if (permission.display !== 'granted' && requestPermission) {
      permission = await LocalNotifications.requestPermissions()
    }

    if (permission.display !== 'granted') {
      return requestPermission ? 'permission-denied' : 'permission-required'
    }

    const { hour, minute } = parseReminderTime(settings.studyReminderTime)

    await LocalNotifications.createChannel({
      id: DAILY_REMINDER_CHANNEL,
      name: 'Nhắc học hằng ngày',
      description: 'Lời nhắc học tiếng Anh của EnglishUp',
      importance: 3,
      vibration: true,
    })

    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_REMINDER_ID,
          title: 'Đến giờ học cùng EnglishUp',
          body: 'Dành vài phút ôn tập hôm nay để giữ nhịp học của bạn nhé.',
          largeBody: 'Dành vài phút ôn tập hôm nay để giữ nhịp học và chuỗi ngày học của bạn nhé.',
          channelId: DAILY_REMINDER_CHANNEL,
          iconColor: '#2563EB',
          schedule: {
            on: { hour, minute },
            repeats: true,
            // Android có thể gửi trễ một chút ở chế độ tiết kiệm pin thay vì đòi quyền báo thức chính xác.
            allowWhileIdle: true,
          },
          extra: { destination: '/lesson/today', type: 'daily-study-reminder' },
        },
      ],
    })

    return 'scheduled'
  } catch {
    return 'failed'
  }
}

/** Khôi phục lịch ở lần mở app sau, tuyệt đối không bật popup xin quyền tự động. */
export function restoreDailyStudyReminder(settings: Pick<UserSettings, 'notificationsEnabled' | 'studyReminderTime'>) {
  return syncDailyStudyReminder(settings, false)
}
