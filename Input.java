import java.util.Scanner;
public class Input{
  public static void main(String[] args) {
    Scanner scan = new Scanner(System.in);
    int c1 = 0;
    while(c1 >= 0){
      System.out.print("Enter the length of a side or a negative number to exit:");
      c1 = scan.nextInt();
      for(int y = 1; y <= c1; y++){
        for(int x = 1; x <= c1; x++){
          if(y == 1 || y == c1){
            System.out.print("*");
          }
          else{
            if(x == 1 || x == c1){
             System.out.print("*");
            }
            else if (x != 1 || x != c1){
             System.out.print(" ");
            }
        }
      }
      System.out.println();
    }
  }
  }
}
