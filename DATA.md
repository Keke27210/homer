# Terms of Service

## Foreword
I am not a lawyer, this has no legal value. This is just to let you know what does Homer store about you and for how long.  
If you want your data to be deleted, join the support server at [discord.gg/fYRm29b](https://discord.gg/fYRm29b) and ask us in #support.  
Please note that data that are kept forever or that cannot be deleted won't be deleted if you ask to.

## General settings
General settings are meant to store everything the bot needs to display a coherent message based on user's language, timezone or preferences.  
Please look at the scheme that explains what data are stored under those :
| property | description                                                  |
|----------|--------------------------------------------------------------|
| id       | Guild or User ID those settings belong to                    |
| locale   | Display locale (default: en-gb)                              |
| timezone | Timezone (default: UTC)                                      |
| prefix   | Custom prefix (default: none)                                |
| radio    | Radio channel (default: none)                                |
| volume   | Radio volume (default: 50%)                                  |
| boost    | Whether boosted (donator) features are enabled (default: no) |
| time     | Custom time format (default: HH:mm:ss)                       |
| date     | Custom date format (default: DD/MM/YYYY)                     |
| updated  | Time when those settings were edited for the last time       |
| created  | Time when those settings were created                        |

Please note that a settings entry only gets created if you edit one of these parameters through user commands.  
Just using the bot will not create any settings for you or your guild.  
Settings are kept forever unless you ask for their deletions (join support server for this).  

## Telephone contracts
Telephone contracts are generated once you have confirmed your subscription using `h:telephone subscribe`. They are kept forever to avoid already-used number generations.  
| property   | description                                                                              |
|------------|------------------------------------------------------------------------------------------|
| id         | Your contract number                                                                     |
| context    | Guild (or user if DM) ID for settings                                                    |
| channel    | ID of the channel this subscriptions belongs to                                          |
| subscriber | ID of the subscriber                                                                     |
| number     | Telephone number associated to this contract                                             |
| state      | Current state for this contract (PENDING/ACTIVE/PAUSED/TERMINATED/SUSPENDED/INVALIDATED) |
| textable   | Whether this subscription allows receiving text messages                                 |
| blacklist  | Array of blacklisted numbers for this line                                               |
| edited     | Time when this subscription was edited for the last time                                 |
| created    | Time when this subscription was created                                                  |

## Telephone calls
Telephone calls are created once you started dialing someone using `h:dial` on an active subscription. They cannot be deleted as they do not contain any personal data.  
| property | description                                            |
|----------|--------------------------------------------------------|
| id       | Call ID                                                |
| caller   | Contract ID of the caller                              |
| called   | Contract ID of the called                              |
| state    | State of the call (PENDING/ACTIVE/TERMINATED/ERROR)    |
| updated  | Time when this call was updated (typing, sent message) |
| created  | Time when this call was instantied                     |

## Phonebook entries
Phonebook entries are associated to a telephone contract. They cannot be deleted as they do not contain any personal data.
| property | description                                            |
|----------|--------------------------------------------------------|
| id       | Contract ID this entry belongs to                      |
| visible  | Whether this entry is visible on the phonebook         |
| message  | Message showed next to the number in the phonebook     |
| updated  | Time when this entry was updated                       |
| created  | Time when this entry was created                       |

## Tracking data
Homer tracks user activity and name changes unless you ask it to do not using `h:track`. Those are deleted as soon as you disabled tracking.  
| property | description                                              |
|----------|----------------------------------------------------------|
| id       | User ID these data belongs to                            |
| activity | Time when this user was seen for the last time           |
| names    | Array of old names for the user (with their change time) |
| updated  | Time when this entry was updated                         |
| created  | Time when this entry was created                         |

## Tags
Homer stores tags you create with various data. To delete a tag, run `h:tag delete <name>`.
| property | description                                          |
|----------|------------------------------------------------------|
| id       | Tag ID                                               |
| name     | Name for the tag                                     |
| content  | Content for the tag                                  |
| author   | ID of the tag author                                 |
| active   | Whether the tag is accessible for other users        |
| source   | Whether the tag source is accessible for other users |
| updated  | Time when this tag was updated                       |
| created  | Time when this tag was created                       |
