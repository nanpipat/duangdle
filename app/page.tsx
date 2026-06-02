"use client";

import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const USER_ID_KEY = "siamsi_user_id";
const TODAY_DRAW_KEY = "siamsi_today_draw";
const HISTORY_KEY = "siamsi_history";
const TOTAL_FORTUNES = 30;
const SHAKE_TARGET = 2500;

type View = "shake" | "dropping" | "reveal";

type DailyDraw = {
  date: string;
  fortuneNumber: number;
  score: number;
  workScore: number;
  moneyScore: number;
  loveScore: number;
};

type Fortune = {
  number: number;
  title: string;
  text: string;
  closing: string;
};

const fortunes: Fortune[] = [
  {
    number: 1,
    title: "รอเวลาที่ใช่ จนเวลามันเริ่มเขินแทนแล้ว",
    text: "คุณมีโปรเจกต์ที่คิดมาดีมาก ดีจนไม่มีใครเห็นเพราะยังอยู่ในหัวทั้งหมด งานจะเดินถ้าคุณเลิกเปิดแท็บใหม่เพื่อหาข้อมูลรอบที่สิบสอง เรื่องเงินเหมือนจะประหยัด แต่ของลดราคาที่ไม่ได้ต้องการก็คือของแพงในชุดแฟนซี ความรักอยากให้ใครสักคนเข้าใจคุณ ทั้งที่คุณยังอธิบายตัวเองด้วยคำว่า ช่างมัน อยู่เลย สุขภาพไม่ได้แย่ แค่ร่างกายเริ่มสงสัยว่าทำไมเวลานอนต้องเริ่มหลังเที่ยงคืนเสมอ",
    closing: "สิ่งที่คุณเรียกว่ารอจังหวะ บางครั้งคนอื่นเรียกว่ากลัวเริ่ม",
  },
  {
    number: 2,
    title: "ปัญหาไม่ได้หายไป แค่ถูกคุณ mute ไว้",
    text: "วันนี้คุณมีแรงพอจะแก้เรื่องค้าง แต่เลือกเอาแรงไปจัด playlist สำหรับทำงานแทน งานที่เลี่ยงอยู่ไม่ได้ซับซ้อนเท่าความสามารถในการหาเรื่องเลี่ยงของคุณ เงินยังพอไหว ถ้าหยุดให้รางวัลตัวเองทุกครั้งที่มีชีวิตรอดถึงบ่ายสาม ความรักต้องการคำตอบ ไม่ใช่สติกเกอร์ที่ส่งไปให้ดูเหมือนยังอยู่ในบทสนทนา ร่างกายขอพักจริงจัง ไม่ใช่นอนเล่นมือถือในท่าเดิมจนไหล่ยื่นเข้าอนาคต",
    closing: "การไม่เปิดอ่านไม่ได้แปลว่าปัญหาอ่านไม่ออก",
  },
  {
    number: 3,
    title: "คุณไม่ได้ยุ่ง คุณแค่กลัวว่างแล้วต้องคิดชีวิต",
    text: "ตารางวันนี้ดูแน่นมาก โดยเฉพาะเมื่อรวมเวลาคิดว่าจะเริ่มงานตอนไหนเข้าไปด้วย งานมีคืบหน้าเล็กน้อยพอให้เอาไปเล่าเหมือนทำเยอะ เงินหายไปกับของจำเป็นตามนิยามที่คุณเพิ่งแต่งตอนกดจ่าย ความรักต้องการเวลาคุณจริง ๆ ไม่ใช่ช่องว่างระหว่างรอลิฟต์กับโหลดหน้าแอป สุขภาพเหมือนยังไหว แต่กาแฟแก้วที่สามไม่ควรถูกเรียกว่าการดูแลตัวเอง วันนี้ถ้าว่างแล้วใจสั่น ไม่ใช่ลางร้าย แค่ความจริงเดินเข้าห้อง",
    closing: "หลายคนไม่มีเวลา แต่คุณไม่มีเวลาสำหรับเรื่องที่ไม่อยากทำพอดี",
  },
  {
    number: 4,
    title: "ปลุกตั้งห้านาฬิกา แต่ยังแพ้ผ้าห่มอยู่ดี",
    text: "เช้านี้คุณตั้งใจจะเป็นคนใหม่อีกครั้ง น่ารักดี เพราะคนใหม่คนนี้กด snooze ได้คล่องเหมือนคนเดิม งานที่ต้องพูดต้องเสนอจะรอดถ้าเตรียมจริง ไม่ใช่ซ้อมในหัวตอนอาบน้ำแล้วเรียกว่าพร้อม เงินมีทางเพิ่มจากไอเดียเก่าที่คุณเก็บไว้เหมือนของดีในตู้ที่ไม่เคยหยิบ ความรักอยากได้การใส่ใจที่จับต้องได้ ไม่ใช่คิดถึงในใจแล้วหวังให้อีกฝ่ายมีญาณทิพย์ หลังกับตากำลังประชุมกันว่าจะประท้วงเมื่อไร",
    closing: "โอกาสมาเคาะประตูแล้ว แต่คุณขอต่ออีกห้านาทีจนมันกลับบ้าน",
  },
  {
    number: 5,
    title: "ของพร้อม คนพร้อม ยกเว้นคุณที่ยังขอคิดก่อน",
    text: "สิ่งที่สะสมมานานเริ่มออกผลแล้ว แต่คุณยังยืนดูเหมือนคนไม่แน่ใจว่าควรดีใจหรือควรกังวลก่อน งานมีคนเห็นฝีมืออยู่ แต่ถ้าคุณยังถ่อมตัวแบบกลัวคนรู้ว่าเก่ง โอกาสก็จะเขินตาม เงินอาจได้คืนจากสิ่งที่รอนาน ระวังเอาไปฉลองล่วงหน้าจนเงินมาไม่ทันใช้ ความรักดีขึ้นได้ถ้าพูด ไม่ใช่หวังให้อีกฝ่ายอ่านใจจากการพิมพ์จุดสามจุด สุขภาพต้องการความสม่ำเสมอ ไม่ใช่ฮึดสามวันแล้วหายไปเหมือนแคมเปญปีใหม่",
    closing: "คุณไม่ได้ขาดโอกาส คุณขาดการยอมรับว่าต้องขยับเอง",
  },
  {
    number: 6,
    title: "ตั้งใจถูกเรื่องได้ไหม หรือจะจริงจังกับเรื่องรองต่อ",
    text: "วันนี้คุณมีพลังดี แต่ดันเอาไปจัดโต๊ะ เปลี่ยนธีมแอป และหาปากกาที่เขียนลื่นที่สุดก่อนเริ่มงาน งานหลักรออยู่เงียบ ๆ แบบคนรู้ชะตากรรม เงินระวังของจำเป็นที่จำเป็นแค่ตอนเห็นรีวิว ความรักมีเสน่ห์จากความนิ่ง แต่ถ้านิ่งเกินไปก็เหมือนอ่านแล้วไม่ตอบมากกว่าลึกลับ คนรอบข้างหวังดีจริง แต่อย่าเพิ่งแปลทุกคำแนะนำเป็นการโจมตี สุขภาพระวังภูมิแพ้ และการบอกว่าเดี๋ยวกินน้ำหลังประชุมที่ไม่เคยจบ",
    closing: "ผิดเป้าอย่างมั่นใจ ก็ยังเรียกว่าผิดเป้าอยู่ดี",
  },
  {
    number: 7,
    title: "ชีวิตไม่ได้ยากขึ้น คุณแค่ไม่อ่านรายละเอียด",
    text: "วันนี้มีเรื่องต้องใช้ความอดทน ซึ่งเป็นทักษะที่คุณชอบบอกว่ามี แต่ใช้จริงได้ประมาณตอนรออาหารมาเสิร์ฟ งานจะพลาดเพราะรายละเอียดเล็ก ๆ ที่คุณข้ามด้วยความมั่นใจระดับน่าเป็นห่วง เงินมีรายจ่ายหลีกเลี่ยงไม่ได้ แต่อย่าเพิ่มรายจ่ายหลีกเลี่ยงได้เพราะหิวแล้วอารมณ์เสีย ความรักต้องลดทิฐิ ไม่ใช่ลดแค่เสียงตอนเถียง สุขภาพระวังการรีบจนสะดุดทั้งทางเดินและชีวิต วันนี้ช้าได้ แต่ต้องอ่านให้ครบ",
    closing: "บางปัญหาไม่ได้ซับซ้อน แค่คุณอ่านครึ่งเดียวแล้วลงความเห็นทั้งฉบับ",
  },
  {
    number: 8,
    title: "โอกาสเปิดประตู แต่คุณมัวหามุมลงสตอรี่",
    text: "วันนี้มีอะไรใหม่เข้ามา อาจเป็นคนคุย ข้อเสนอ หรือไอเดียที่ดีกว่าการนั่งรีเฟรชชีวิตเดิม งานเด่นเรื่องการพูด แต่ขอให้พูดเรื่องที่มีสาระบ้าง ไม่ใช่แค่บ่นว่าตัวเองงานเยอะ เงินมีช่องทางเสริม ถ้าคุณยอมใช้ทักษะจริงแทนการเซฟโพสต์หารายได้ไว้ดูชาติหน้า ความรักสดใสจากรายละเอียดเล็ก ๆ ที่คุณมักเห็นเฉพาะตอนอยากจับผิด สุขภาพระวังพูดเยอะจนเสียงแห้ง แล้วบอกว่าเครียดทั้งที่พูดเองเกือบทั้งหมด",
    closing: "บางประตูเปิดอยู่แล้ว แต่คุณเสียเวลาถามว่าควรผลักหรือดึง",
  },
  {
    number: 9,
    title: "ข้อมูลมีครึ่งหน้า แต่สรุปเหมือนอ่านวิทยานิพนธ์",
    text: "วันนี้ยังไม่ถึงจุดพีค แต่คุณพร้อมตัดสินทุกอย่างจากหลักฐานสองบรรทัดกับความรู้สึกตอนหิว งานอย่าเพิ่งฟันธงใหญ่จากข่าวลือในแชตที่สะกดชื่อลูกค้ายังผิด เงินควรกันสำรองไว้บ้าง ไม่ใช่เพื่อความเท่ แต่เพื่อไม่ต้องยืมตัวเองในอนาคตทุกเดือน ความรักต้องการพื้นที่ ไม่ใช่เช็กสถานะกันถี่เหมือนพัสดุ สุขภาพระวังไมเกรนจากหน้าจอ และความสามารถพิเศษในการนอนดึกเพื่อดูเรื่องที่พรุ่งนี้จำไม่ได้",
    closing: "ชีวิตพังมาหลายรอบเพราะคุณเรียกลางสังหรณ์ว่าข้อมูล",
  },
  {
    number: 10,
    title: "ของดีอยู่ใกล้ แต่คุณชอบวิ่งไปหาอะไรที่เหนื่อยกว่า",
    text: "วันนี้มีเรื่องดีอยู่แถวหน้า แต่คุณอาจมองข้ามเพราะมัวหาความยิ่งใหญ่แบบที่ต้องโพสต์ได้ งานเหมาะกับการส่งผลงานหรือขอความช่วยเหลือ อย่าทำเป็นเข้มแข็งแล้วบ่นในใจว่าไม่มีใครช่วย เงินดีจากสิ่งที่ถนัดจริง ไม่ใช่สิ่งที่คุณเห็นคนอื่นทำแล้วรวยในคลิปสามนาที ความรักดีขึ้นจากคำขอบคุณธรรมดา ไม่ต้องรอซื้อของแพงตอนรู้สึกผิด สุขภาพควรนอนให้เป็นเวลา ซึ่งสำหรับคุณอาจฟังเหมือนตำนานพื้นบ้าน",
    closing: "ความสุขไม่ได้ซ่อน คุณแค่ชอบมองข้ามแล้วบอกว่าหายาก",
  },
  {
    number: 11,
    title: "ทำได้นิดเดียวแล้วอย่าเพิ่งตั้งโต๊ะแถลงข่าว",
    text: "วันนี้คุณทำได้บางอย่าง ซึ่งดี แต่ยังไม่ถึงขั้นต้องให้รางวัลตัวเองด้วยของที่แพงกว่าความสำเร็จ งานต้องการความละเอียด และคนที่เช็กงานจริง ไม่ใช่คุณในเวอร์ชันง่วงที่บอกว่าเดี๋ยวค่อยอ่าน เงินอย่าซื้อของตอนเหนื่อย เพราะสมองคุณตอนเหนื่อยเห็นทุกอย่างเป็นการเยียวยา ความรักต้องการความมั่นคงจากการกระทำ ไม่ใช่ประโยคสวยที่ส่งหลังหายไปทั้งวัน สุขภาพระวังนอนไม่หลับจากความกังวลที่คุณเรียกว่าแค่คิดเล่น ๆ",
    closing: "พอใจกับก้าวเล็กได้ แต่อย่าหยุดแล้วเรียกมันว่าปลายทาง",
  },
  {
    number: 12,
    title: "เกือบเสร็จแล้ว แต่อย่าเพิ่งทำพังด้วยความรีบ",
    text: "งานบางอย่างใกล้จบมาก ใกล้จนคุณเริ่มประมาทและอยากฉลองก่อนส่งจริง ระวังจุดเล็ก ๆ ที่คุณคิดว่าใครจะไปเห็น เพราะคนที่จะเห็นมักเป็นคนที่คุณไม่อยากให้เห็น เงินมีทางเคลียร์ได้ถ้ายอมคุย ไม่ใช่ปล่อยให้ใบแจ้งเตือนทำงานฝ่ายเดียว ความรักเหมาะกับการวางแผน แต่คนโสดไม่ต้องรีบจีบใครเพื่อพิสูจน์ว่าชีวิตมีพล็อต สุขภาพระวังท้องอืดจากการกินไม่เป็นเวลา ซึ่งคุณรู้ดีแต่ยังทำหน้าเหมือนเพิ่งค้นพบ",
    closing: "เกือบถึงไม่ได้แปลว่าถึง โดยเฉพาะถ้าคุณชอบสะดุดตอนท้าย",
  },
  {
    number: 13,
    title: "คิดเผื่อทุกทาง ยกเว้นทางที่ต้องลงมือ",
    text: "เรื่องที่คุณคิดว่าน่ากลัว จริง ๆ อาจเล็กกว่าหนังตัวอย่างที่ฉายในหัวคุณทั้งคืน งานมีปัญหาเล็กน้อยที่ต้องใช้ไหวพริบ ไม่ใช่การประชุมเพิ่มอีกหนึ่งรอบเพื่อให้ทุกคนกังวลพร้อมกัน เงินระวังค่าใช้จ่ายเซอร์ไพรส์ โดยเฉพาะของที่พังหลังคุณเพิ่งบอกว่าเดือนนี้จะประหยัด ความรักมีคำถามค้างอยู่ แต่คุณเลือกตีความจากน้ำเสียงแทนการถามตรง ๆ สุขภาพระวังหลังและเอว เพราะคุณแบกทั้งงาน ทั้งคน ทั้งบทสนทนาที่จบไปแล้ว",
    closing: "ความกังวลไม่ใช่แผนสำรอง แม้มันจะกินเวลาคุณเหมือนงานประจำ",
  },
  {
    number: 14,
    title: "มีพอแล้ว แต่สมองคุณยังเปิดโหมดขาดแคลน",
    text: "ผลจากความพยายามเก่ากำลังกลับมา แต่คุณอาจยุ่งกับการสงสัยว่าตัวเองสมควรได้ไหมจนลืมรับมัน งานมีคนไว้ใจคุณในเรื่องสำคัญ เลิกทำหน้าเหมือนระบบสุ่มเลือกผิดคน เงินเก็บเพิ่มได้ถ้าหยุดหาเหตุผลให้ของที่อยากได้ฟังดูเหมือนการลงทุน ความรักอบอุ่นจากเรื่องธรรมดา ไม่ต้องสร้างเหตุการณ์พิเศษทุกครั้งที่อยากรู้สึกมีค่า สุขภาพระวังน้ำตาล และการกินเพราะเบื่อแล้วโกหกตัวเองว่าร่างกายเรียกร้อง",
    closing: "บางทีคุณไม่ได้ขาดอะไร แค่เสพความไม่พอจนชินปาก",
  },
  {
    number: 15,
    title: "ถูกเรียกให้เด่น แต่ยังห่วงว่าหน้าดูเหนื่อยไหม",
    text: "วันนี้คุณอาจต้องออกหน้าในเรื่องที่หลบไม่ได้แล้ว งานเด่นแต่เหนื่อย เพราะคุณชอบรับบทคนรับผิดชอบแล้วแอบโกรธที่ไม่มีใครห้าม เงินเข้าออกเร็ว โดยเฉพาะค่าเข้าสังคมที่เริ่มจากไปแป๊บเดียวและจบด้วยยอดโอนหลายรายการ ความรักสดใสขึ้นถ้าลดบทคนลึกลับ เพราะความเงียบของคุณบางทีไม่ได้มีเสน่ห์ แค่ทำให้คนอื่นเหนื่อย สุขภาพระวังคาเฟอีนเยอะจนใจเต้นเหมือนมี deadline อยู่ในอก",
    closing: "คุณอยากให้คนเห็นคุณค่า แต่บางวันก็ซ่อนตัวเก่งเหมือนไม่อยากถูกรบกวน",
  },
  {
    number: 16,
    title: "เคลียร์ของค้างก่อน ค่อยฝันถึงชีวิตใหม่ก็ได้",
    text: "วันนี้เหมาะกับการจัดระเบียบชีวิตแบบไม่ต้องซื้อสมุดใหม่มาหลอกตัวเอง งานค้างหลายชิ้นไม่ได้ต้องการแรงบันดาลใจ ต้องการให้คุณเปิดไฟล์แล้วเลิกถอนหายใจใส่มัน เงินมีรายรับย่อยที่ควรเก็บ ไม่ใช่มองว่าเล็กเกินแล้วใช้ใหญ่กว่าเดิม ความรักต้องฟังให้จบก่อนตอบ เพราะคุณชอบเตรียมเถียงตั้งแต่ประโยคแรก สุขภาพระวังดื่มน้ำน้อยแล้วคิดว่ากาแฟนับรวมได้ ไม่ได้นะ อันนี้ไม่ได้ล้อ",
    closing: "ชีวิตใหม่จะเริ่มยากมาก ถ้าชีวิตเก่ายังอยู่ในกล่องแจ้งเตือน",
  },
  {
    number: 17,
    title: "รู้ทางแล้ว แต่ยังถามทุกคนเพื่อเลื่อนการตัดสินใจ",
    text: "วันนี้ความชัดเจนมาถึง แต่คุณอาจไม่ชอบ เพราะความชัดเจนมักบอกว่าเลิกถามคนที่ห้าซะที งานมีทางเลือกใหม่ ข้อดีข้อเสียชัดพอแล้ว เหลือแค่เลิกทำตารางเปรียบเทียบเพื่อซื้อเวลา เงินเหมาะกับการตัดรายจ่ายที่รู้ว่าไม่จำเป็น โดยเฉพาะ subscription ที่คุณจำไม่ได้ว่าใช้ทำอะไร ความรักต้องมีเป้าหมายร่วม ไม่ใช่อยู่ไปวัน ๆ แล้วหวังให้ความสัมพันธ์อัปเดตเอง สุขภาพระวังเวียนหัวจากนั่งนิ่งนาน และคิดมากเร็วเกินร่างกายตามทัน",
    closing: "คำปรึกษาที่สิบไม่ได้ทำให้ฉลาดขึ้นเสมอไป บางทีมันแค่ทำให้คุณยังไม่ต้องเลือก",
  },
  {
    number: 18,
    title: "มีคนช่วยอยู่ แต่คุณยุ่งกับการทำตัวเหมือนสู้คนเดียว",
    text: "วันนี้มีแรงสนับสนุนจากคนรอบข้าง แต่คุณอาจมองไม่เห็นเพราะมัวสร้างภาพคนแบกโลกเงียบ ๆ งานที่ติดจะผ่านได้ถ้ายอมรับความช่วยเหลือโดยไม่รู้สึกว่าศักดิ์ศรีหล่นลงพื้น เงินมีรายจ่ายเพื่อความมั่นคง จ่ายแล้วเจ็บ แต่เจ็บน้อยกว่าปล่อยไว้จนกลายเป็นเรื่องใหญ่ ความรักแม้มีปากเสียงก็ยังมีความห่วงใย แต่อย่าใช้คำว่าเป็นห่วงแทนคำขอโทษทุกครั้ง สุขภาพระวังเจ็บคอจากทั้งอากาศและการกลืนคำพูดตัวเอง",
    closing: "คุณไม่ได้แพ้เพราะขอให้ช่วย แพ้เพราะดื้อแล้วเรียกมันว่าอดทน",
  },
  {
    number: 19,
    title: "ทางออกมีอยู่ แต่ต้องเดินเอง น่าเสียดายเนอะ",
    text: "วันนี้ทุกอย่างมีทางออก แค่ไม่ใช่ทางที่คุณนั่งรอแล้วมันมารับถึงโต๊ะ งานดีในเรื่องที่ต้องทำต่อเนื่อง ไม่ใช่ทำวันเดียวแล้วเปิด LinkedIn รอคนค้นพบพรสวรรค์ เงินสะสมได้ถ้าหยุดตัดทิ้งก่อนเห็นยอด เพราะคำว่าแค่นิดเดียวรวมกันแล้วหน้าตาเหมือนหนี้ ความรักต้องให้เวลาพิสูจน์ ไม่ใช่สรุปจากการตอบช้าหนึ่งครั้ง สุขภาพควรขยับบ้าง นอกจากนิ้วที่เลื่อนหน้าจอเหมือนกำลังแข่งขันระดับชาติ",
    closing: "หลายเรื่องในชีวิตแก้ได้ด้วยการลงมือทำ ซึ่งเป็นข่าวร้ายสำหรับคุณพอดี",
  },
  {
    number: 20,
    title: "โอกาสอยู่ตรงหน้า แต่คุณเปิดโหมดเตรียมตัวนิรันดร์",
    text: "วันนี้มีข้อเสนอหรือโปรเจกต์น่าสนใจเข้ามา และคุณจะอยากเตรียมตัวเพิ่มอีกนิดแบบไม่มีวันจบ งานต้องใช้ความรอบคอบ แต่รอบคอบจนโอกาสเดินผ่านไปก็ไม่ต้องเรียกว่าวางแผน เงินมีลาภจากสิ่งที่คุณทำได้ดีจริง ไม่ใช่สิ่งที่คุณฝืนทำเพราะคิดว่าดูเท่กว่า ความรักมีคนเห็นคุณค่า แต่คุณยังชอบลดราคาตัวเองในใจเหมือนจัดโปร สุขภาพระวังอาหารเค็ม และความเครียดที่เค็มกว่าเพื่อนตอนทวงเงิน",
    closing: "กุญแจอยู่กับคุณมาตลอด แค่คุณมัวถามว่ากุญแจนี้ใช่ตัวตนเราหรือเปล่า",
  },
  {
    number: 21,
    title: "ชีวิตเริ่มสว่าง แต่คุณยังเลื่อนฟีดในความมืด",
    text: "ความหวังที่จางไปเริ่มกลับมา แต่คุณต้องตื่นพอจะเห็น ไม่ใช่ตื่นมาด้วยตาแห้งจากคลิปที่ดูต่อเนื่องจนระบบแนะนำเริ่มเป็นห่วง งานมีจุดเปลี่ยนเล็ก ๆ ที่ต่อยอดได้ ถ้าคุณไม่ดูถูกมันเพราะไม่อลังการ เงินถ้ามีคนชวนลงทุน ให้ถามรายละเอียด ไม่ใช่ถามแค่คนอื่นได้กำไรเท่าไร ความรักอบอุ่นจากบทสนทนาจริง ๆ ไม่ใช่ส่ง meme แล้วนับเป็นการเปิดใจ สุขภาพระวังข้อมือ นิ้ว และการถือมือถือเหมือนมันเป็นอวัยวะถาวร",
    closing: "แสงไม่ได้แพ้ความมืด แพ้คุณที่ยังไม่ยอมวางโทรศัพท์",
  },
  {
    number: 22,
    title: "วิธีใหม่มาแล้ว แต่คุณยังรักความลำบากแบบเดิม",
    text: "วันนี้ช่องทางใหม่หรือคนใหม่อาจพาคุณออกจากวงจรเก่าได้ ถ้าคุณเลิกบูชาความคุ้นเคยที่ทำให้เหนื่อย งานเหมาะกับการร่วมมือ ไม่ใช่แบกคนเดียวแล้วโพสต์ว่าเหนื่อยแบบไม่ระบุชื่อ เงินมีทางออกจากปัญหาเก่า ถ้ายอมรับว่าวิธีเดิมไม่ work มานานพอจะเลิกโรแมนติกกับมัน ความรักมีโอกาสเริ่มหน้าใหม่ แต่ต้องวางของเก่าก่อน ไม่ใช่ถือไว้แล้วบอกว่ามือว่าง สุขภาพระวังไหล่จากภาระจริงและภาระที่คุณสมัครใจรับเอง",
    closing: "คุณไม่ได้ติดทางตัน คุณติดนิสัยเดินกลับไปหามัน",
  },
  {
    number: 23,
    title: "เรื่องเหนื่อยเริ่มให้ผล แต่คุณยังสงสัยว่าควรดีใจไหม",
    text: "สิ่งที่ลากมานานเริ่มมีสัญญาณบวกแล้ว แต่คุณอาจยังระแวงเพราะชินกับการเตรียมใจพังมากกว่ารับข่าวดี งานมีคำตอบหรืออนุมัติที่รออยู่ อย่าทำหน้าเหมือนไม่เชื่อระบบเมื่อมันทำงานถูกสักครั้ง เงินมีรายจ่ายเพื่อซ่อมสิ่งที่ควรซ่อมนานแล้ว เจ็บแต่จบ ดีกว่าประหยัดวันนี้แล้วเสียแพงกว่าเดิม ความรักเหมาะกับการขอโทษ ไม่ใช่รอให้อีกฝ่ายลืมเอง สุขภาพต้องการอากาศถ่ายเท และพื้นที่สมองที่ไม่อัดแน่นด้วยเรื่องเดิม",
    closing: "ข่าวดีไม่ได้น่าสงสัยเสมอไป คุณแค่ชินกับการคิดเผื่อเจ็บ",
  },
  {
    number: 24,
    title: "สิ่งที่รอมาถึงแล้ว แต่คุณดันไม่รู้จะรับยังไง",
    text: "ของที่รอมานานอาจมาถึงในรูปแบบที่ไม่ตรงสคริปต์ในหัวคุณ งานมีคนที่น่าเชื่อถือเข้ามาช่วย แต่คุณต้องเลิกทำเหมือนคำแนะนำคือการสอบตก เงินมีเกณฑ์ดีขึ้น แต่อย่าใช้หมดตั้งแต่เงินยังเป็นตัวเลขในความหวัง ความรักคนโสดรอได้อีกนิด ส่วนคนมีคู่ระวังคำพูดตอนเครียด เพราะคุณมีพรสวรรค์ในการพูดสั้นแต่เจ็บยาว สุขภาพพักให้พอ ไม่ใช่ฝืนจนร่างกายต้องส่งอีเมลทวงถาม",
    closing: "บางโอกาสไม่ได้มาช้า คุณแค่ยังไม่ได้เตรียมใจรับสิ่งดี ๆ",
  },
  {
    number: 25,
    title: "เรื่องเก่ากลับมา แต่คราวนี้คุณโตพอหรือยัง",
    text: "วันนี้คนเก่าหรือโอกาสเก่าอาจกลับมาในเวอร์ชันที่ดูดีขึ้น จนคุณลืมถามว่าตัวเองยังนิสัยเดิมไหม งานมีจังหวะจากสิ่งที่เคยทำไว้ อย่าดูถูกประสบการณ์เก่าเพียงเพราะมันไม่เท่เทรนด์ใหม่ เงินเหมาะกับการเก็บ โดยเฉพาะตอนอารมณ์ดีที่คุณชอบฉลองเหมือนได้โบนัสทั้งที่แค่รอดเดือน ความรักดีขึ้นจากการสนใจพื้นฐาน ไม่ใช่จัดใหญ่ปีละครั้งแล้วพักยาว สุขภาพระวังปวดท้องจากความเครียดที่คุณเรียกว่าปกติ",
    closing: "อดีตกลับมาได้ แต่ถ้าคุณยังเหมือนเดิม มันก็แค่วนฉายซ้ำ",
  },
  {
    number: 26,
    title: "ความจริงชัดมาก แต่คุณยังปรับแสงให้มันดูนุ่ม",
    text: "วันนี้เหมาะกับการเผชิญความจริง ไม่ใช่แต่งเหตุผลให้มันฟังดูน่ารักขึ้น งานมีเรื่องต้องพูดตรง ๆ เลือกคำให้ดี แต่อย่าอ้อมจนคนฟังต้องใช้แผนที่ เงินมีช่องรั่วที่คุณเห็นอยู่แล้ว แต่ยังปลอบใจว่ารูเล็ก ทั้งที่ยอดรวมไม่เล็กตาม ความรักต้องการความซื่อสัตย์ ไม่ใช่การเอาใจเพื่อหลีกเลี่ยงบทสนทนายาก สุขภาพระวังตึงกรามจากการกัดฟัน และผิวแพ้จากความเครียดที่คุณพยายามเรียกว่าเรื่องชิล",
    closing: "ความจริงไม่ได้แรงเกินไป คุณแค่ซ้อมหนีมันมานาน",
  },
  {
    number: 27,
    title: "ไอเดียเต็มหัว แต่ไฟล์ยังว่างเหมือนอนาคตตอนสิ้นเดือน",
    text: "วันนี้เหมาะกับงานเขียน งานพูด หรืองานสร้างสรรค์ที่คุณบอกว่าอยากทำมานานจนมันเริ่มมีอายุราชการ งานจะเริ่มได้ถ้าคุณพิมพ์ประโยคแรก ไม่ใช่รอแรงบันดาลใจในขณะที่เลื่อนดูคนอื่นมีแรงบันดาลใจ เงินมาจากสิ่งที่คุณรู้และถ่ายทอดได้ ไม่ต้องเก่งทุกเรื่อง แค่เลิกแกล้งไม่เก่งเรื่องที่ตัวเองทำได้ ความรักมีคำที่ค้างอยู่ พูดเถอะ ก่อนมันหมักจนกลายเป็นประชด สุขภาพระวังมือจากการพิมพ์เยอะเฉพาะในแชต ไม่ใช่งาน",
    closing: "แรงบันดาลใจไม่ใช่พนักงานส่งของ มันไม่มาถึงถ้าคุณไม่เปิดงาน",
  },
  {
    number: 28,
    title: "เป้าหมายใหญ่ แต่สมาธิสั้นกว่า caption",
    text: "วันนี้เป้าหมายยังอยู่ไกล แต่ไม่ไกลเท่าความสามารถในการวอกแวกของคุณ งานใหญ่ต้องแบ่งเป็นชิ้นเล็ก ไม่ใช่มองทั้งหมดแล้วเครียดจนไปล้างแก้วแทน เงินมีรายจ่ายเพื่ออนาคตที่เจ็บตอนนี้ แต่เจ็บน้อยกว่าการไม่มีแผนแล้วหวังให้เดือนหน้ามีปาฏิหาริย์ ความรักต้องอดทนกับความต่าง ไม่ใช่คาดหวังให้อีกฝ่ายคิดเหมือนคุณทุกเรื่องเพราะคุณขี้เกียจอธิบาย สุขภาพระวังหลังล่างจากการนั่งท่าเดิมและแบกเป้าหมายที่ยังไม่เริ่ม",
    closing: "เป้าหมายไม่ได้ไกลขึ้น คุณแค่หยุดพักบ่อยจนเรียกมันว่าการทบทวน",
  },
  {
    number: 29,
    title: "คนรอบข้างพร้อมช่วย แต่คุณยังพร้อมบ่นมากกว่า",
    text: "วันนี้มีแรงสนับสนุนมากกว่าที่คุณคิด แต่ต้องขอก่อน ไม่ใช่รอให้คนอื่นเดาใจจากสีหน้าตอนตอบว่าไม่เป็นไร งานดีเมื่อร่วมมือ แทนที่จะแบกเองแล้วไปบ่นในแชตส่วนตัวว่าไม่มีใครเข้าใจ เงินมีลาภจากการขาย แลก หรือใช้ของที่มีอยู่ให้เป็นประโยชน์ แปลว่าอย่าเพิ่งซื้อใหม่เพราะของเก่าทำให้รู้สึกไม่ fresh ความรักมีบรรยากาศดี ๆ อย่าดูถูกมันเพราะไม่ดราม่าพอ สุขภาพระวังอารมณ์ร้อนแล้วเรียกว่าพูดตรง",
    closing: "โลกไม่ได้ไม่ช่วยคุณเสมอไป บางทีคุณแค่ไม่ยอมพูดให้ชัด",
  },
  {
    number: 30,
    title: "ทุกอย่างเริ่มชัด ยกเว้นเหตุผลที่คุณยังนอนตีสอง",
    text: "ช่วงนี้หลายอย่างเริ่มเข้าที่ งานมีโอกาสได้รับการยอมรับจากสิ่งที่คุณทำจริง ไม่ใช่จากการคิดว่าจะทำอย่างอลังการในอนาคต เงินดีจากวินัยที่สะสมมา ถ้ามีวินัยจริงก็รักษาไว้ อย่าเพิ่งฉลองด้วยการทำลายวินัยทันที ความรักมั่นคงแต่ต้องระวังความสบายกลายเป็นความละเลย เพราะคำว่าเขาคงเข้าใจถูกใช้แทนความใส่ใจบ่อยเกิน สุขภาพระวังกล้ามเนื้อตึงจากนั่งดึก และคำถามคลาสสิกว่าจะได้อะไรจากการนอนตีสองทุกคืน นอกจากใต้ตากับความมั่นใจผิด ๆ",
    closing: "ชีวิตไม่ได้ติดบั๊ก คุณแค่กดใช้ชีวิตแบบเดิมแล้วหวังผลลัพธ์ใหม่",
  },
];

const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];

function toThaiNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => thaiDigits[Number(digit)]);
}

function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShareDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getOrCreateUserId() {
  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(USER_ID_KEY, id);
  return id;
}

function buildDailyDraw(userId: string, dateKey: string): DailyDraw {
  const seed = hashString(`${userId}:${dateKey}`);
  const toPercent = (s: number) => 35 + (s % 55);
  return {
    date: dateKey,
    fortuneNumber: (seed % TOTAL_FORTUNES) + 1,
    score: (Math.floor(seed / TOTAL_FORTUNES) % 5) + 1,
    workScore: toPercent(hashString(`${userId}:${dateKey}:w`)),
    moneyScore: toPercent(hashString(`${userId}:${dateKey}:m`)),
    loveScore: toPercent(hashString(`${userId}:${dateKey}:l`)),
  };
}

function persistHistory(draw: DailyDraw) {
  const rawHistory = window.localStorage.getItem(HISTORY_KEY);
  const history: DailyDraw[] = rawHistory ? JSON.parse(rawHistory) : [];
  const nextHistory = [
    draw,
    ...history.filter((entry) => entry.date !== draw.date),
  ].slice(0, 14);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
}

function getStoredDraw(dateKey: string): DailyDraw | null {
  const rawDraw = window.localStorage.getItem(TODAY_DRAW_KEY);
  if (!rawDraw) return null;

  try {
    const draw = JSON.parse(rawDraw) as DailyDraw;
    return draw.date === dateKey ? draw : null;
  } catch {
    return null;
  }
}

function getTimeRemaining() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const totalSeconds = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => toThaiNumber(String(part).padStart(2, "0")))
    .join(":");
}

function scoreBlocks(score: number) {
  return "🟩".repeat(score) + "⬛".repeat(5 - score);
}

function starRating(score: number) {
  return "★".repeat(score) + "☆".repeat(5 - score);
}

function scoreLabel(score: number) {
  return ["พอใช้", "พอใช้", "ดี", "ดีมาก", "ดีมาก"][score - 1] ?? "ดี";
}

export default function Home() {
  const [view, setView] = useState<View>("shake");
  const [draw, setDraw] = useState<DailyDraw | null>(null);
  const [history, setHistory] = useState<DailyDraw[]>([]);
  const [shakePower, setShakePower] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [shareState, setShareState] = useState("แชร์ดวงประจำวัน");
  const [countdown, setCountdown] = useState(() => getTimeRemaining());
  const lastPoint = useRef<{ x: number; y: number; time: number } | null>(null);
  const fortunePaperRef = useRef<HTMLElement>(null);
  const isCapturing = useRef(false);

  const fortune = useMemo(
    () => fortunes.find((item) => item.number === draw?.fortuneNumber) ?? fortunes[0],
    [draw],
  );

  useEffect(() => {
    window.setTimeout(() => {
      const dateKey = formatDateKey();
      const userId = getOrCreateUserId();
      const stored = getStoredDraw(dateKey);
      const rawHistory = window.localStorage.getItem(HISTORY_KEY);

      if (rawHistory) {
        try {
          setHistory(JSON.parse(rawHistory) as DailyDraw[]);
        } catch {
          setHistory([]);
        }
      }

      if (stored) {
        setDraw(stored);
        setView("reveal");
        persistHistory(stored);
        return;
      }

      setDraw(buildDailyDraw(userId, dateKey));
    }, 0);
  }, []);

  useEffect(() => {
    const initialTick = window.setTimeout(() => setCountdown(getTimeRemaining()), 0);
    const timer = window.setInterval(() => setCountdown(getTimeRemaining()), 1000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(timer);
    };
  }, []);

  const completeDraw = useCallback(() => {
    if (view !== "shake") return;

    const lockedDraw = buildDailyDraw(getOrCreateUserId(), formatDateKey());
    window.localStorage.setItem(TODAY_DRAW_KEY, JSON.stringify(lockedDraw));
    persistHistory(lockedDraw);
    setDraw(lockedDraw);
    setHistory((current) => [
      lockedDraw,
      ...current.filter((entry) => entry.date !== lockedDraw.date),
    ].slice(0, 14));
    setView("dropping");
    window.setTimeout(() => setView("reveal"), 1300);
  }, [view]);

  const addShake = useCallback(
    (force: number, nextTilt: number) => {
      if (view !== "shake") return;

      setTilt(Math.max(-18, Math.min(18, nextTilt)));
      setShakePower((current) => {
        const next = Math.min(SHAKE_TARGET, current + force);
        if (next >= SHAKE_TARGET) {
          window.setTimeout(completeDraw, 80);
        }
        return next;
      });

      if (!isMuted && navigator.vibrate) {
        navigator.vibrate(12);
      }
    },
    [completeDraw, isMuted, view],
  );

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      const force =
        Math.abs(acceleration?.x ?? 0) +
        Math.abs(acceleration?.y ?? 0) +
        Math.abs(acceleration?.z ?? 0);

      if (force > 34 && view === "shake") {
        addShake(force * 2, force % 2 === 0 ? 12 : -12);
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [addShake, view]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    lastPoint.current = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
    };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDragging || !lastPoint.current) return;

    const now = performance.now();
    const dx = event.clientX - lastPoint.current.x;
    const dy = event.clientY - lastPoint.current.y;
    const elapsed = Math.max(12, now - lastPoint.current.time);
    const distance = Math.hypot(dx, dy);
    const velocity = distance / elapsed;

    if (distance > 3) {
      addShake(distance * (1.5 + velocity), dx * 0.55);
      lastPoint.current = {
        x: event.clientX,
        y: event.clientY,
        time: now,
      };
    }
  }

  function onPointerUp() {
    setIsDragging(false);
    setTilt(0);
    lastPoint.current = null;
  }

  async function shareFortune() {
    if (!draw || !fortunePaperRef.current || isCapturing.current) return;

    isCapturing.current = true;
    setShareState("กำลังสร้างรูป…");

    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(fortunePaperRef.current, {
        backgroundColor: "#FFF9EE",
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (_doc: Document, el: HTMLElement) => {
          el.style.animation = "none";
          el.style.opacity = "1";
          el.style.transform = "none";
        },
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );

      if (!blob) throw new Error("blob failed");

      const file = new File([blob], "duangdle.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "ดวงประจำวัน · daungdle.com" });
        setShareState("แชร์ดวงประจำวัน");
      } else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "duangdle-fortune.png";
        anchor.click();
        URL.revokeObjectURL(url);
        setShareState("บันทึกรูปแล้ว");
        window.setTimeout(() => setShareState("แชร์ดวงประจำวัน"), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setShareState("แชร์ดวงประจำวัน");
      } else {
        setShareState("เกิดข้อผิดพลาด");
        window.setTimeout(() => setShareState("แชร์ดวงประจำวัน"), 2000);
      }
    } finally {
      isCapturing.current = false;
    }
  }

  const progress = Math.round((shakePower / SHAKE_TARGET) * 100);

  return (
    <main className={`app-shell ${view === "reveal" ? "is-reveal" : ""}`}>
      <div className="ambient" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="cloud cloud-three" />
        <span className="leaf leaf-one" />
        <span className="leaf leaf-two" />
        <span className="leaf leaf-three" />
        <span className="spark spark-one" />
        <span className="spark spark-two" />
      </div>

      <nav className="top-actions" aria-label="เมนูหลัก">
        <button
          className="round-action"
          type="button"
          onClick={() => setIsMuted((current) => !current)}
          aria-label={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
        >
          <SoundIcon muted={isMuted} />
        </button>
        <button
          className="history-action"
          type="button"
          onClick={() => setShowHistory(true)}
          aria-label="เปิดประวัติ"
        >
          <CalendarIcon />
          <span>ประวัติ</span>
        </button>
      </nav>

      {view !== "reveal" ? (
        <section className="shake-view" aria-label="เขย่าเซียมซี">
          <div className="title-block">
            <div className="ornament">
              <span />
              <FlowerIcon />
              <span />
            </div>
            <h1>เซียมซีวันนี้</h1>
            <p>เขย่าให้ใบเซียมซีตกลงมา</p>
          </div>

          <div
            className={`siamsi-stage ${isDragging ? "is-shaking" : ""} ${view === "dropping" ? "is-dropping" : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
            role="button"
            tabIndex={0}
            aria-label="ลากเพื่อเขย่ากระบอกเซียมซี"
          >
            <div className="stick-fall">
              <div className="fortune-stick dropped">
                <span>ใบที่</span>
                <strong>{draw ? toThaiNumber(draw.fortuneNumber) : "?"}</strong>
              </div>
            </div>
            <SiamsiSVG />
          </div>

          <button className="shake-cta" type="button" onClick={() => addShake(150, tilt >= 0 ? -15 : 15)}>
            <HandIcon />
            <span>
              <strong>เขย่าเซียมซี</strong>
              <small>หรือ ลากกระบอกเพื่อเขย่า</small>
            </span>
            <ChevronIcon />
          </button>
          <div className="shake-progress" aria-label={`พลังเขย่า ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>
      ) : (
        <section className="reveal-view" aria-label="คำทำนายประจำวัน">
          <div className="reveal-scroll">
            <article className="fortune-paper" ref={fortunePaperRef}>
              <div className="paper-lines" aria-hidden="true" />
              <span className="paper-site">daungdle.com</span>
              <div className="paper-stars-block">
                <p className="paper-score">{draw ? starRating(draw.score) : "★★★☆☆"}</p>
                <p className="paper-kicker">ใบที่ {toThaiNumber(fortune.number)} · {draw ? formatShareDate(draw.date) : ""}</p>
              </div>
              <h1 className="paper-title">{fortune.title}</h1>
              <hr className="paper-rule" />
              <p className="fortune-text">{fortune.text}</p>
              <div className="fortune-closing">
                <span className="fortune-closing-deco" aria-hidden="true">&rdquo;</span>
                {fortune.closing}
              </div>
              <hr className="paper-rule" />
              <div className="score-bars">
                {[
                  { label: "💼 การงาน", value: draw?.workScore ?? 60 },
                  { label: "💰 การเงิน", value: draw?.moneyScore ?? 60 },
                  { label: "❤️ ความรัก", value: draw?.loveScore ?? 60 },
                ].map(({ label, value }) => (
                  <div className="score-bar-row" key={label}>
                    <span className="score-bar-label">{label}</span>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${value}%` }} />
                    </div>
                    <span className="score-bar-num">{value}%</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
          <div className="reveal-footer">
            <button type="button" className="reveal-share-btn" onClick={shareFortune}>
              🔮 {shareState}
            </button>
            <p className="reveal-countdown">
              คุณเสี่ยงทายดวงวันนี้แล้ว กลับมาใหม่อีกครั้งในเวลา <strong>{countdown}</strong>
            </p>
          </div>
        </section>
      )}

      {showHistory ? (
        <div className="history-overlay" role="dialog" aria-modal="true" aria-label="ประวัติเซียมซี">
          <div className="history-panel">
            <div className="history-header">
              <h2>ประวัติ</h2>
              <button type="button" onClick={() => setShowHistory(false)} aria-label="ปิดประวัติ">
                ×
              </button>
            </div>
            {history.length ? (
              <ol>
                {history.map((entry) => (
                  <li key={entry.date}>
                    <span>{formatShareDate(entry.date)}</span>
                    <strong>ใบที่ {toThaiNumber(entry.fortuneNumber)}</strong>
                    <em>{scoreBlocks(entry.score)}</em>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty-history">ยังไม่มีประวัติการเสี่ยงทาย</p>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SiamsiSVG() {
  return (
    <svg viewBox="0 0 400 460" className="siamsi-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`
          .main-outline { stroke: #5C3A21; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
          .thin-outline { stroke: #5C3A21; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
          .inner-wood { stroke: #E6CBB2; stroke-width: 2.5; stroke-linecap: round; }
          .cn-text { font-family: 'Courier New', sans-serif; font-weight: 900; fill: #CC5A46; font-size: 16px; }
        `}</style>
        <linearGradient id="bucket-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F7DCAE" />
          <stop offset="15%" stopColor="#FCE2B6" />
          <stop offset="85%" stopColor="#FCE2B6" />
          <stop offset="100%" stopColor="#EAC998" />
        </linearGradient>
        <linearGradient id="stick-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E27B66" />
          <stop offset="100%" stopColor="#D36B58" />
        </linearGradient>
      </defs>

      <path d="M 40 160 C 35 150, 45 140, 55 145 C 50 155, 45 165, 40 160 Z" fill="#9FB892" className="thin-outline" transform="rotate(-15 45 150)" />
      <path d="M 40 160 L 52 147" stroke="#5C3A21" strokeWidth="1.5" />

      <g transform="translate(340, 180) scale(0.8)">
        <circle cx="0" cy="0" r="6" fill="#F3A39E" className="thin-outline" />
        <circle cx="-10" cy="0" r="5" fill="#F5B5B1" className="thin-outline" />
        <circle cx="10" cy="0" r="5" fill="#F5B5B1" className="thin-outline" />
        <circle cx="0" cy="-10" r="5" fill="#F5B5B1" className="thin-outline" />
        <circle cx="0" cy="10" r="5" fill="#F5B5B1" className="thin-outline" />
      </g>
      <g transform="translate(70, 370) scale(0.7)">
        <circle cx="0" cy="0" r="6" fill="#F3A39E" className="thin-outline" />
        <circle cx="-10" cy="0" r="5" fill="#F5B5B1" className="thin-outline" />
        <circle cx="10" cy="0" r="5" fill="#F5B5B1" className="thin-outline" />
        <circle cx="0" cy="-10" r="5" fill="#F5B5B1" className="thin-outline" />
        <circle cx="0" cy="10" r="5" fill="#F5B5B1" className="thin-outline" />
      </g>

      <ellipse cx="200" cy="415" rx="90" ry="14" fill="#EADCC9" />

      <g id="all-sticks">
        <g className="svg-fortune-stick" transform="translate(120, 130) rotate(-14)">
          <path d="M -28 -20 C -28 -42, 28 -42, 28 -20 L 22 130 L -22 130 Z" fill="#F4E3D3" className="main-outline" />
          <path d="M -23 -18 C -23 -34, 23 -34, 23 -18 L 18 126 L -18 126 Z" fill="url(#stick-grad)" />
          <rect x="-13" y="-6" width="26" height="70" rx="10" fill="#FCE2B6" className="thin-outline" />
          <circle cx="0" cy="5" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="11" textAnchor="middle" className="cn-text">上</text>
          <circle cx="0" cy="33" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="39" textAnchor="middle" className="cn-text">上</text>
        </g>

        <g className="svg-fortune-stick" transform="translate(158, 105) rotate(-5)">
          <path d="M -28 -20 C -28 -42, 28 -42, 28 -20 L 22 140 L -22 140 Z" fill="#F4E3D3" className="main-outline" />
          <path d="M -23 -18 C -23 -34, 23 -34, 23 -18 L 18 136 L -18 136 Z" fill="url(#stick-grad)" />
          <rect x="-13" y="-8" width="26" height="55" rx="10" fill="#FCE2B6" className="thin-outline" />
          <circle cx="0" cy="3" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="9" textAnchor="middle" className="cn-text">上</text>
          <circle cx="0" cy="30" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="36" textAnchor="middle" className="cn-text">上</text>
        </g>

        <g className="svg-fortune-stick" transform="translate(200, 95) rotate(0)">
          <path d="M -32 -20 C -32 -44, 32 -44, 32 -20 L 25 140 L -25 140 Z" fill="#F4E3D3" className="main-outline" />
          <path d="M -27 -18 C -27 -36, 27 -36, 27 -18 L 21 136 L -21 136 Z" fill="url(#stick-grad)" />
          <rect x="-15" y="-8" width="30" height="85" rx="12" fill="#FCE2B6" className="thin-outline" />
          <circle cx="0" cy="5" r="12" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="12" textAnchor="middle" className="cn-text" fontSize="18">上</text>
          <circle cx="0" cy="35" r="12" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="42" textAnchor="middle" className="cn-text" fontSize="18">上</text>
          <text x="0" y="66" textAnchor="middle" fill="#FFFBF5" fontSize="14" fontWeight="bold">签</text>
        </g>

        <g className="svg-fortune-stick" transform="translate(242, 105) rotate(6)">
          <path d="M -28 -20 C -28 -42, 28 -42, 28 -20 L 22 140 L -22 140 Z" fill="#F4E3D3" className="main-outline" />
          <path d="M -23 -18 C -23 -34, 23 -34, 23 -18 L 18 136 L -18 136 Z" fill="url(#stick-grad)" />
          <rect x="-13" y="-8" width="26" height="60" rx="10" fill="#FCE2B6" className="thin-outline" />
          <circle cx="0" cy="3" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="9" textAnchor="middle" className="cn-text">上</text>
          <circle cx="0" cy="30" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="36" textAnchor="middle" className="cn-text">上</text>
        </g>

        <g className="svg-fortune-stick" transform="translate(280, 130) rotate(15)">
          <path d="M -28 -20 C -28 -42, 28 -42, 28 -20 L 22 130 L -22 130 Z" fill="#F4E3D3" className="main-outline" />
          <path d="M -23 -18 C -23 -34, 23 -34, 23 -18 L 18 126 L -18 126 Z" fill="url(#stick-grad)" />
          <rect x="-13" y="-6" width="26" height="70" rx="10" fill="#FCE2B6" className="thin-outline" />
          <circle cx="0" cy="5" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="11" textAnchor="middle" className="cn-text">上</text>
          <circle cx="0" cy="33" r="11" fill="#FFFBF5" className="thin-outline" />
          <text x="0" y="39" textAnchor="middle" className="cn-text">上</text>
        </g>
      </g>

      <g id="main-bucket">
        <path d="M 112 230 L 288 230 C 298 230, 292 240, 286 290 L 272 390 C 270 405, 255 408, 200 408 C 145 408, 130 405, 128 390 L 114 290 C 108 240, 102 230, 112 230 Z" fill="url(#bucket-grad)" className="main-outline" />
        <path d="M 148 231 C 150 290, 153 350, 156 406" className="inner-wood" />
        <path d="M 200 232 L 200 408" stroke="#E6CBB2" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 252 231 C 250 290, 247 350, 244 406" className="inner-wood" />
        <path d="M 107 232 C 107 226, 293 226, 293 232 L 290 242 C 290 237, 110 237, 110 242 Z" fill="#EAC998" className="main-outline" />
        <circle cx="200" cy="315" r="42" fill="#CC5A46" className="main-outline" />
        <circle cx="200" cy="315" r="37" fill="none" stroke="#EAC998" strokeWidth="1.5" />
        <text x="200" y="331" textAnchor="middle" fill="white" fontFamily="sans-serif" fontWeight="900" fontSize="46">签</text>
      </g>

      <g id="ribbon-and-clouds">
        <path d="M 270 355 C 315 345, 330 380, 295 405 C 280 415, 265 395, 275 380" fill="#CC5A46" className="main-outline" />
        <path d="M 290 392 C 282 385, 305 370, 312 385 C 322 385, 318 398, 302 397 Z" fill="#FFF5E4" className="thin-outline" />
        <path d="M 111 346 C 160 382, 240 375, 292 334 L 285 366 C 230 412, 160 412, 112 376 Z" fill="#CC5A46" className="main-outline" />
        <g transform="translate(112, 345)">
          <path d="M -5 20 C -25 22, -32 2, -12 -5 C -15 -25, 12 -22, 16 -8 C 32 -10, 35 15, 15 22 C 10 22, 0 25, -5 20 Z" fill="#FFF5E4" className="main-outline" />
          <path d="M -2 10 C -8 7, -3 0, 3 4 C 7 10, 0 16, -6 11 C -2 8, 0 7, 1 6" fill="none" stroke="#5C3A21" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      {muted ? (
        <>
          <path d="m18 9-4 6" />
          <path d="m14 9 4 6" />
        </>
      ) : (
        <>
          <path d="M16 8c1.4 1.3 1.4 6.7 0 8" />
          <path d="M18.5 5.5c3 3 3 10 0 13" />
        </>
      )}
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4.5 8h15M6 5h12a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 12h.1M12 12h.1M16 12h.1M8 16h.1M12 16h.1M16 16h.1" />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path d="M14 10c3.5-8 10.8-1.1 4 4 8 3.5 1.1 10.8-4 4-3.5 8-10.8 1.1-4-4-8-3.5-1.1-10.8 4-4Z" />
      <circle cx="14" cy="14" r="2.4" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path d="M9.5 13.5V6.8a1.6 1.6 0 0 1 3.2 0V13" />
      <path d="M12.7 13V5.4a1.7 1.7 0 0 1 3.4 0v8" />
      <path d="M16.1 13.5V7.3a1.6 1.6 0 0 1 3.2 0v8.2" />
      <path d="M19.3 15.5v-3a1.5 1.5 0 1 1 3 0v4.8c0 5.1-3.4 8.2-8.1 8.2-4 0-6-2.1-7.7-5.1L4 16a1.7 1.7 0 0 1 2.9-1.7l2 3.1" />
      <path d="M5.5 5.5 3.4 3.4M7 2.5V0M2.5 8H0" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path d="m9 7 7 7-7 7" />
      <path d="m16 7 7 7-7 7" />
    </svg>
  );
}
