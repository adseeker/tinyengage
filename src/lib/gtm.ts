// GTM Event Tracking Utilities

interface GTMEvent {
  event: string
  [key: string]: any
}

// Push events to GTM dataLayer
export const gtmPush = (eventData: GTMEvent) => {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    ;(window as any).dataLayer.push(eventData)
    console.log('GTM Event:', eventData) // Debug log
  }
}

// Common tracking events for TinyEngagement
export const trackEvent = {
  // Button clicks
  buttonClick: (buttonName: string, location?: string) => {
    gtmPush({
      event: 'button_click',
      button_name: buttonName,
      location: location || 'unknown',
    })
  },

  // Page navigation  
  pageView: (pageName: string) => {
    gtmPush({
      event: 'page_view',
      page_name: pageName,
    })
  },

  // Survey actions
  surveyCreated: (surveyType: string) => {
    gtmPush({
      event: 'survey_created',
      survey_type: surveyType,
    })
  },

  surveyResponse: (surveyId: string, optionSelected: string) => {
    gtmPush({
      event: 'survey_response',
      survey_id: surveyId,
      option_selected: optionSelected,
    })
  },

  // User actions
  userSignUp: (method?: string) => {
    gtmPush({
      event: 'user_signup',
      signup_method: method || 'email',
    })
  },

  userLogin: (method?: string) => {
    gtmPush({
      event: 'user_login',
      login_method: method || 'email',
    })
  },

  // Link clicks
  linkClick: (linkUrl: string, linkText: string) => {
    gtmPush({
      event: 'link_click',
      link_url: linkUrl,
      link_text: linkText,
    })
  },

  // Form interactions
  formSubmit: (formName: string) => {
    gtmPush({
      event: 'form_submit',
      form_name: formName,
    })
  },
}