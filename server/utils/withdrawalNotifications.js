import { createNotification } from '../controllers/notificationController.js';

/**
 * Send notification when withdrawal request is submitted
 */
export const notifyWithdrawalSubmitted = async (userId, amount, method) => {
  const methodName = method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer';
  
  await createNotification(
    userId,
    "Withdrawal Request Submitted 💰",
        `Your withdrawal request of Rs${amount} via ${methodName} has been submitted successfully. We'll process it within 1-3 business days.`,
    "info",
    null,
    "withdrawal_submitted"
  );
};

/**
 * Send notification when withdrawal is approved
 */
export const notifyWithdrawalApproved = async (userId, amount, transactionReference = null) => {
  const message = transactionReference 
            ? `Great news! Your withdrawal request of Rs${amount} has been approved and processed. Transaction reference: ${transactionReference}`
        : `Great news! Your withdrawal request of Rs${amount} has been approved and processed. You should receive the funds within 1-3 business days.`;

  await createNotification(
    userId,
    "Withdrawal Approved ✅",
    message,
    "success",
    null,
    "withdrawal_approved"
  );
};

/**
 * Send notification when withdrawal is rejected
 */
export const notifyWithdrawalRejected = async (userId, amount, rejectionReason = null) => {
  const message = rejectionReason 
            ? `Your withdrawal request of Rs${amount} has been rejected. Reason: ${rejectionReason}. Your balance has been restored.`
        : `Your withdrawal request of Rs${amount} has been rejected. Please contact support for more information. Your balance has been restored.`;

  await createNotification(
    userId,
    "Withdrawal Request Rejected ❌",
    message,
    "warning",
    null,
    "withdrawal_rejected"
  );
};

/**
 * Send notification when withdrawal is edited
 */
export const notifyWithdrawalEdited = async (userId, changes) => {
  const changesList = Object.keys(changes).map(key => {
          if (key === 'amount') return `Amount updated to Rs${changes[key]}`;
    if (key === 'mobileBankingDetails') return 'Mobile banking details updated';
    if (key === 'bankTransferDetails') return 'Bank transfer details updated';
    return `${key} updated`;
  }).join(', ');

  await createNotification(
    userId,
    "Withdrawal Request Updated 📝",
    `Your withdrawal request has been updated by our admin team. Changes: ${changesList}. The request is still being processed.`,
    "info",
    null,
    "withdrawal_edited"
  );
};

/**
 * Send notification to admin when new withdrawal request is submitted
 */
export const notifyAdminNewWithdrawal = async (adminUsers, userInfo, amount, method) => {
  const methodName = method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer';
  
  // Send notification to all admin users
  for (const adminUser of adminUsers) {
    await createNotification(
      adminUser._id,
      "New Withdrawal Request 🔔",
      `${userInfo.firstName} ${userInfo.lastName} has submitted a withdrawal request of Rs${amount} via ${methodName}. Please review and process.`,
      "info",
      null,
      "admin_new_withdrawal"
    );
  }
};

/**
 * Send email notification (if email service is available)
 */
export const sendWithdrawalEmailNotification = async (userEmail, type, data) => {
  // This would integrate with your email service
  // For now, we'll just log it
  
  
  // Example implementation:
  // const emailTemplates = {
  //   submitted: {
  //     subject: 'Withdrawal Request Submitted',
  //     template: 'withdrawal-submitted'
  //   },
  //   approved: {
  //     subject: 'Withdrawal Approved',
  //     template: 'withdrawal-approved'
  //   },
  //   rejected: {
  //     subject: 'Withdrawal Rejected',
  //     template: 'withdrawal-rejected'
  //   }
  // };
  
  // if (emailService && emailTemplates[type]) {
  //   await emailService.send({
  //     to: userEmail,
  //     subject: emailTemplates[type].subject,
  //     template: emailTemplates[type].template,
  //     data: data
  //   });
  // }
};

/**
 * Get notification templates for different withdrawal events
 */
export const getWithdrawalNotificationTemplates = () => {
  return {
    submitted: {
      title: "Withdrawal Request Submitted 💰",
      type: "info",
      action: "withdrawal_submitted"
    },
    approved: {
      title: "Withdrawal Approved ✅",
      type: "success",
      action: "withdrawal_approved"
    },
    rejected: {
      title: "Withdrawal Request Rejected ❌",
      type: "warning",
      action: "withdrawal_rejected"
    },
    edited: {
      title: "Withdrawal Request Updated 📝",
      type: "info",
      action: "withdrawal_edited"
    },
    admin_new: {
      title: "New Withdrawal Request 🔔",
      type: "info",
      action: "admin_new_withdrawal"
    }
  };
};