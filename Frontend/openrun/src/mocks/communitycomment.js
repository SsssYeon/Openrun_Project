const commentmocks = [
    // --- post_001 (헤드윅 시야 후기) 댓글 ---
    {
        postDocumentId: "post_001",
        commentDocumentId: "cmt_1001",
        commentContent: "2층 시야가 생각보다 괜찮다니 좋네요! 오츠카 챙겨가야 하나 고민이었는데 감사합니다!",
        userId: "user_a123",
        userNickname: "뮤덕_레미",
        dommentState: 0,
        commentTimeStamp: "2025-05-01T12:05:00Z", // 작성일: 2025-05-01 21:05 (KST)
        commentReportCnt: 0
    },
    {
        postDocumentId: "post_001",
        commentDocumentId: "cmt_1002",
        commentContent: "배우 표정 디테일 아쉬운 건 공감합니다 ㅠㅠ 저도 A열이었는데 망원경 없이는 힘들더라고요.",
        userId: "user_b456",
        userNickname: "꿀팁_전수자",
        dommentState: 0,
        commentTimeStamp: "2025-05-01T13:40:00Z", // 작성일: 2025-05-01 22:40 (KST)
        commentReportCnt: 1
    },

    // --- post_002 (리어왕 후기) 댓글 ---
    {
        postDocumentId: "post_002",
        commentDocumentId: "cmt_2001",
        commentContent: "저도 리어왕 보고 왔는데 광기 연기 정말 대단했죠... 다음 관람 후기 기대할게요!",
        userId: "user_c789",
        userNickname: "제인친구",
        dommentState: 0,
        commentTimeStamp: "2025-08-03T04:15:00Z", // 작성일: 2025-08-03 13:15 (KST)
        commentReportCnt: 0
    },

    // --- post_003 (예시 추가) 댓글 ---
    {
        postDocumentId: "post_003",
        commentDocumentId: "cmt_3001",
        commentContent: "이 글 보고 공연 정보 바로 예매했어요! 감사해요!",
        userId: "user_d012",
        userNickname: "달려라_티켓",
        dommentState: 0,
        commentTimeStamp: "2025-09-10T09:30:00Z",
        commentReportCnt: 0
    },
    {
        postDocumentId: "post_003",
        commentDocumentId: "cmt_3002",
        commentContent: "혹시 주차 꿀팁 있을까요? 주차장이 너무 복잡해서요.",
        userId: "user_e345",
        userNickname: "주차_고민",
        dommentState: 0,
        commentTimeStamp: "2025-09-10T10:00:00Z",
        commentReportCnt: 0
    },

    // --- post_005 댓글 (신고 예시) ---
    {
        postDocumentId: "post_005",
        commentDocumentId: "cmt_5001",
        commentContent: "이건 좀 아닌 것 같네요. 내용이 불쾌합니다.",
        userId: "user_f678",
        userNickname: "관리자신고",
        dommentState: 0,
        commentTimeStamp: "2025-07-20T11:00:00Z",
        commentReportCnt: 5 // 신고 5회
    },
    {
        postDocumentId: "post_005",
        commentDocumentId: "cmt_5002",
        commentContent: "다른 의견입니다. 저는 공감합니다.",
        userId: "user_g901",
        userNickname: "다른의견",
        dommentState: 0,
        commentTimeStamp: "2025-07-20T11:30:00Z",
        commentReportCnt: 0
    },
    
    // --- post_010 댓글 (숨김/삭제 예시) ---
    {
        postDocumentId: "post_010",
        commentDocumentId: "cmt_10001",
        commentContent: "운영 정책 위반으로 삭제된 댓글입니다.",
        userId: "user_h234",
        userNickname: "삭제된유저",
        dommentState: 1, // 숨김/삭제 상태
        commentTimeStamp: "2025-06-01T08:00:00Z",
        commentReportCnt: 10
    },
    {
        postDocumentId: "post_010",
        commentDocumentId: "cmt_10002",
        commentContent: "댓글이 안 보이는데 오류인가요?",
        userId: "user_i567",
        userNickname: "궁금증",
        dommentState: 0,
        commentTimeStamp: "2025-06-01T08:30:00Z",
        commentReportCnt: 0
    },

    // 나머지 게시글 (post_004, post_006 ~ post_009, post_011 ~ post_024)에 대한 일반 댓글
    // 코드 길이를 줄이기 위해 반복문을 사용하여 생성 (실제 파일에는 풀어서 작성 권장)
    // 여기서는 몇 개의 대표 예시만 남기고 나머지 ID는 생략하겠습니다.
];

// post_024에 대한 최신 댓글
commentmocks.push({
    postDocumentId: "post_024",
    commentDocumentId: "cmt_24001",
    commentContent: "오늘 올라온 따끈따끈한 후기 잘 봤습니다! 덕분에 예매 결정했어요.",
    userId: "user_new",
    userNickname: "최신정보통",
    dommentState: 0,
    commentTimeStamp: "2025-10-10T15:00:00Z",
    commentReportCnt: 0
});

export { commentmocks };