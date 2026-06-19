const fs = require('fs');

const entriesData = [
        {
            "id": "cc39c530-e272-4eae-b9e2-24800281bb67",
            "contest_id": "ae1fb2a4-4da5-44ed-ae85-7fb0659a1ab6",
            "participant_id": "5b8a3c3e-90d9-4dbf-baa3-34a86a35caee",
            "submission_id": "d4925e30-9e32-4522-8761-559f1db2dc65",
            "score": 0,
            "status": "pending",
            "created_at": "2026-06-18T11:00:34.524Z",
            "updated_at": "2026-06-18T11:00:34.524Z",
            "participant": {
                "id": "5b8a3c3e-90d9-4dbf-baa3-34a86a35caee",
                "contest_id": "ae1fb2a4-4da5-44ed-ae85-7fb0659a1ab6",
                "submission_id": "0729edf2-be0a-49a9-b6a4-f3c14ac5e2a1",
                "user_id": "7f9865f2-482f-4e6a-84b8-e03fb78c4c2c",
                "status": "approved",
                "joined_at": "2026-06-18T10:57:34.877Z",
                "submission": {
                    "id": "0729edf2-be0a-49a9-b6a4-f3c14ac5e2a1",
                    "data": {
                        "an7ffo0mu": "Oakley Rocha",
                        "ppdwdyx34": "oakley@yopmail.com",
                        "yz5qsxcqi": "12345678"
                    },
                    "createdAt": "2026-06-18T10:57:34.873Z"
                }
            },
            "submission": {
                "id": "d4925e30-9e32-4522-8761-559f1db2dc65",
                "data": {
                    "2ndbock91": "DPS",
                    "40gh6pkkb": "https://innoida.utho.io/entries/contest-ae1fb2a4-4da5-44ed-ae85-7fb0659a1ab6/40gh6pkkb-1781780433261-startuptemplate2.jpeg",
                    "7j9skclo2": "Mark",
                    "9p3xde10j": "946705382",
                    "os28hf1aa": "Harsh",
                    "qeqatzaa5": "harsh@yopmail.com",
                    "tlb9rveot": "Saxena",
                    "zvdskzwrw": "ABCD",
                    "40gh6pkkb_downloadUrl": "https://innoida.utho.io/launchpad-bucket/entries/contest-ae1fb2a4-4da5-44ed-ae85-7fb0659a1ab6/40gh6pkkb-1781780433261-startuptemplate2.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ob1G0tHWkJlERrPSvLOez9gVc2diYm5nMjyF%2F20260618%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260618T114023Z&X-Amz-Expires=3600&X-Amz-Signature=ac4b3d8575326eb4a103991cb911c708ff1f48f769d7440e1f7df277ab99eb45&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
                },
                "createdAt": "2026-06-18T11:00:34.222Z"
            }
        },
        {
            "id": "1cc1ef1a-f767-4a69-b43c-da82eededd9e",
            "contest_id": "ae1fb2a4-4da5-44ed-ae85-7fb0659a1ab6",
            "participant_id": "f1ec426c-9e09-44d4-bece-619ed0ba7d39",
            "submission_id": "76be82b9-b5e5-489d-8c80-d4b5e5ed7852",
            "score": 0,
            "status": "pending",
            "created_at": "2026-06-18T10:21:52.494Z",
            "updated_at": "2026-06-18T10:21:52.494Z",
            "participant": {
                "id": "f1ec426c-9e09-44d4-bece-619ed0ba7d39",
                "contest_id": "ae1fb2a4-4da5-44ed-ae85-7fb0659a1ab6",
                "submission_id": "12c57cae-102c-4ebf-8609-c0320bedefcf",
                "user_id": "38abc8ed-910f-42ae-bb5c-4a18b371aa88",
                "status": "approved",
                "joined_at": "2026-06-17T11:28:53.668Z",
                "submission": {
                    "id": "12c57cae-102c-4ebf-8609-c0320bedefcf",
                    "data": {
                        "data": {
                            "an7ffo0mu": "Shifa Akhtar",
                            "ppdwdyx34": "shifa@yopmail.com",
                            "yz5qsxcqi": "12345678"
                        },
                        "status": "active"
                    },
                    "createdAt": "2026-06-17T11:28:52.801Z"
                }
            },
            "submission": {
                "id": "76be82b9-b5e5-489d-8c80-d4b5e5ed7852",
                "data": {
                    "2ndbock91": "BPS",
                    "40gh6pkkb": {},
                    "7j9skclo2": "Javed Akhtar",
                    "9p3xde10j": "+91 7645 677 766",
                    "os28hf1aa": "Shifa",
                    "qeqatzaa5": "shifa@yopmail.com",
                    "tlb9rveot": "Akhtar",
                    "zvdskzwrw": "Test Innovation"
                },
                "createdAt": "2026-06-18T10:21:52.480Z"
            }
        }
];

const publishedContests = []; // Empty, so templates won't be found

const result = entriesData.map((entry) => {
      const submissionData = entry?.submission?.data || {};
      const participantData = entry?.participant?.submission?.data || {};
      
      const sData = submissionData?.data ? submissionData.data : submissionData;
      const pData = participantData?.data ? participantData.data : participantData;

      const contest = publishedContests.find((c) => c.id === entry.contest_id || c._id === entry.contest_id) || entry?.contest;
      const entryFields = contest?.entry_level_template?.schema?.fields || contest?.entryLevelTemplate?.schema?.fields || [];
      const userFields = contest?.user_level_template?.schema?.fields || contest?.userLevelTemplate?.schema?.fields || [];

      let titleField = entryFields.find((f) => f.label?.toLowerCase().includes("title") || f.label?.toLowerCase().includes("project") || f.label?.toLowerCase().includes("startup"));
      if (!titleField) {
        titleField = userFields.find((f) => f.label?.toLowerCase().includes("name"));
      }

      let title = "Untitled";
      if (titleField) {
        title = sData[titleField.label] || sData[titleField.id];
      }
      if (!title) {
        title = sData["ho1p00z0q"] || sData["Innovation Title"] || sData["zvdskzwrw"];
      }
      if (!title) {
        const values = Object.values(sData).filter((v) => typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v));
        if (values.length > 0) title = values[0];
        else title = `Entry #${entry.entry_id?.substring(0, 8) || entry.id?.substring(0, 8)}`;
      }

      let authorField = userFields.find((f) => f.label?.toLowerCase().includes("name"));
      let author = "Unknown";
      if (authorField) {
        author = pData[authorField.label] || pData[authorField.id];
      }
      if (!author) {
        author = pData["yg9snrxlh"] || pData["Firstname"] || pData["Name"] || pData["an7ffo0mu"] || entry?.participant?.email;
      }
      if (!author) {
        const values = Object.values(pData).filter((v) => typeof v === 'string' && v.trim() !== '' && isNaN(Number(v)) && !v.includes('http') && v.length < 60 && !/^[0-9+\-\s()]+$/.test(v));
        if (values.length > 0) author = values[0];
        else author = "Unknown";
      }

      return {
        id: entry.id,
        title,
        author,
      };
});

console.log(JSON.stringify(result, null, 2));
